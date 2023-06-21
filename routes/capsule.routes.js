import express from "express";
import { CapsuleModel } from "../model/capsule.model.js";
import { UserModel } from "../model/user.model.js";
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";

const capsuleRouter = express.Router();

// usuário logado cria uma cápsula
capsuleRouter.post(
  "/create-capsule",
  isAuth /* middleware que valida se o token é válido (se usuário está logado)! Lembrando que é opcional dependendo da regra de negócio! */,
  attachCurrentUser /* middleware que recebe a informação do anterior e identifica o usuário! */,
  async (req, res) => {
    try {
      const user = req.currentUser; //isso aqui não é facultativo?

      // cria uma nova caps
      const newCapsule = await CapsuleModel.create({
        // objs q serão guardados no DB
        ...req.body, // enviado no corpo da REQ
        capsuleCreator:
          req.currentUser
            ._id /* pela chave capsuleCreator no capsuleModel, podemos acessar ao ID do usuário criador da caps, 
            pois req.currentUser pois todas as info do user */,
      });

      // referencia a caps criada acima ao usuário criador (coloca o ID na caps)
      await UserModel.findOneAndUpdate(
        { _id: req.currentUser._id } /* obj de busca */,
        {
          $push: {
            capsulesCreated: newCapsule._id,
          } /* info que será atualizada */,
        },
        { new: true, runValidators: true }
      );

      return res.status(201).json(newCapsule);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

//get.all
//usuário precisa estar logado e só pode ver as suas capsulas no dash!
// precisa do capsuleId no endpoint?
capsuleRouter.get(
  "/dashboard",
  isAuth /* Se tirar, todos usuários terão acesso */,
  attachCurrentUser,
  async (req, res) => {
    try {
      const allCapsules = await CapsuleModel.find({
        capsuleCreator: req.currentUser._id,
      });

      return res.status(200).json(allCapsules);
    } catch (error) {
      console.log(error);
      return res.status(500).json("Capsules not found.");
    }
  }
);

// usuário logado vê capsule details!
capsuleRouter.get("/:capsuleId", async (req, res) => {
  try {
    const capsule = await CapsuleModel.findOne({
      _id: req.params.capsuleId,
    }).populate("capsuleCreator");

    delete capsule._doc.capsuleCreator.passwordHash;

    return res.status(200).json(capsule);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// usuário logado edita uma cápsula dele!
capsuleRouter.put(
  "/:capsuleId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      if (!req.currentUser.capsule.includes(req.params.capsuleId)) {
        return req.status(401).json("Access denied!");
      }

      const updatedCapsule = await CapsuleModel.findOneAndUpdate(
        { _id: req.params._id },
        { ...req.body },
        { new: true, runValidators: true }
      );

      return res.status(200).json(updatedCapsule);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

// usuário delete uma capsule!
capsuleRouter.delete(
  "/:capsuleId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      if (!req.currentUser.capsule.includes(req.params.capsuleId)) {
        return req.status(401).json("Access denied!");
      }

      const deletedCapsule = await CapsuleModel.deleteOne({
        _id: req.params.capsuleId,
      });

      await UserModel.findOneAndUpdate(
        { _id: req.currentUser._id },
        { $pull: { capsulesCreated: req.params.capsuleId } },
        { new: true, runValidators: true }
      );

      return res.status(200).json(deletedCapsule);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

export default capsuleRouter;
