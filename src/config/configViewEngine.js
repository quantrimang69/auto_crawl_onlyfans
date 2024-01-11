const express = require('express');

const configViewEngine = (app) => {
  // static để server biết chỉ được lấy data từ đâu
  app.use(express.static('./public'));
  // thiết lập kiểu view engine là ejs
  app.set('view engine', 'ejs');
  // đường link lấy view engine
  app.set('views', `./src/views`);
};

module.exports = configViewEngine;
