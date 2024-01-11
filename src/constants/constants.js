const LIMIT = 10;
const PAGE = 1;

const RESPONSE = {
  SUCCESS: 'Success',
  LOGIN_SUCCESS: 'Login Success',
  SEND_EMAIL_SUCCESSFULLY: 'Send email successfully',
  NO_VIDEO: 'No video',
};

const TYPE_ACCOUNT = {
  ADMIN: 0,
  CUSTOMER: 1,
};

const ERROR = {
  Default: 100,
  InternalServerError: 101,
  NoData: 102,
  AccountDoesNotExist: 103,
  PasswordIsNotCorrect: 104,
  // user 111 - 130
  CanNotGetUser: 111,
  CanNotCreateUser: 112,
  CanNotDeleteUser: 113,
  CanNotUpdateUser: 114,
  EmailIsExist: 115,
  UserIsRequired: 116,
  EmailIsRequired: 117,
  PasswordIsRequired: 118,
  CantNotVerifyEmail: 119,
  CantNotSendVerifyEmail: 120,
  CantNotResetPassword: 121,
  CantNotUpdatePassword: 122,
  FirstNameIsRequired: 122,
  LastNameIsRequired: 122,
  // Product 131
  ProductIsRequired: 131,
  CanNotGetProduct: 132,
  CanNotCreateProduct: 133,
  CanNotDeleteProduct: 134,
  CanNotUpdateProduct: 135,
  // Categories 141
  NameCategorieIsRequired: 141,
  SlugCategorieIsRequired: 142,
  CanNotGetCategory: 143,
  CanNotCreateCategory: 144,
  CanNotDeleteCategory: 145,
  CanNotUpdateCategory: 146,
  // Products 151
  NameProductIsRequired: 151,
  PriceProductIsRequired: 152,
  SaleProductIsRequired: 153,
  CategorieIsRequired: 158,
  // Wishlists 171
  CanNotGetWishlist: 171,
  CanNotCreateWishlist: 172,
  CanNotDeleteWishlist: 173,
  CanNotUpdateWishlist: 174,
  // Wishlists 181
  CanNotGetInvoice: 181,
  CanNotCreateInvoice: 182,
  CanNotDeleteInvoice: 183,
  CanNotUpdateInvoice: 184,
};

module.exports = {
  RESPONSE, ERROR, TYPE_ACCOUNT, LIMIT, PAGE
};
