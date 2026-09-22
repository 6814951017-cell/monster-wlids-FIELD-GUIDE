const express = require("express");

const { requireAdmin } = require('../middlewares/auth.middleware')

const createResourceRoutes = (controller) => {
  const router = express.Router();
  router.route("/").get(controller.list).post(controller.create);
  router.route("/:id").get(controller.getOne).patch(controller.update).delete(requireAdmin, controller.remove);
  return router;
};

module.exports = createResourceRoutes;
