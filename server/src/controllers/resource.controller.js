const mongoose = require("mongoose");

const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const isObjectId = (value) => mongoose.isValidObjectId(value);

const createResourceController = ({ Model, filterFields = [], populate = [] }) => {
  const list = async (req, res, next) => {
    try {
      const filter = {};
      for (const field of filterFields) {
        if (req.query[field] !== undefined) filter[field] = req.query[field];
      }
      const searchField = Model.schema.path("name") ? "name" : Model.schema.path("title") ? "title" : null;
      if (req.query.q && searchField) {
        filter[searchField] = { $regex: req.query.q, $options: "i" };
      }

      const { page, limit, skip } = getPagination(req.query);
      const [data, total] = await Promise.all([
        Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(populate),
        Model.countDocuments(filter),
      ]);
      res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  const getOne = async (req, res, next) => {
    try {
      const query = isObjectId(req.params.id) ? { _id: req.params.id } : { slug: req.params.id };
      const document = await Model.findOne(query).populate(populate);
      if (!document) return res.status(404).json({ message: "Resource not found" });
      res.json(document);
    } catch (error) {
      next(error);
    }
  };

  const create = async (req, res, next) => {
    try {
      const document = await Model.create(req.body);
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  };

  const update = async (req, res, next) => {
    try {
      const document = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!document) return res.status(404).json({ message: "Resource not found" });
      res.json(document);
    } catch (error) {
      next(error);
    }
  };

  const remove = async (req, res, next) => {
    try {
      const document = await Model.findByIdAndDelete(req.params.id);
      if (!document) return res.status(404).json({ message: "Resource not found" });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  return { list, getOne, create, update, remove };
};

module.exports = createResourceController;
