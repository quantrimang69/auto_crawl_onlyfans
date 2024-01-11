const adminRouter = require('./admin.route');

const initRoutes = (app) => {
  app.use('/', adminRouter);
  // Handle not found URL errors
  app.use("*", (req, res) => {
    const err = Error(`Requested path ${req.path} not found`);
    res.status(404).send({
      success: false,
      message: `Requested path ${req.path} not found`,
      stack: err.stack,
    });
  });
}

module.exports = initRoutes;