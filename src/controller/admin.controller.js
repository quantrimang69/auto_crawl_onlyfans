const service = require("../service/admin.service");
const ResponseHelper = require('../utils/response');
const catchAsync = require("../utils/errorHandle/catchAsync");
const MessageHelper = require('../utils/message');

const updateNewVideo = catchAsync(async (req,res) => {
  try {
    await service.updateNewVideo(req, res);
    ResponseHelper.responseSuccess(res, MessageHelper.getMessage('sendEmailSuccessfully'));
  } catch (error) {
    ResponseHelper.responseError(res, error.message);
  }
});
const getVideos = catchAsync(async (req,res) => {
  try {
    const videos = await service.getVideos(req, res);
    ResponseHelper.responseSuccess(res, videos);
  } catch (error) {
    ResponseHelper.responseError(res, error.message);
  }
});

module.exports = {
  updateNewVideo, getVideos
}