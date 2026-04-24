'use strict';

const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Token = require('./Token');
const Exchange = require('./Exchange');
const { Order, OrderItem } = require('./Order');
const ChatMessage = require('./ChatMessage');

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Product.hasMany(Token, { foreignKey: 'productId', as: 'tokens' });
Token.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Token, { foreignKey: 'currentOwnerId', as: 'ownedTokens' });
Token.belongsTo(User, { foreignKey: 'currentOwnerId', as: 'currentOwner' });
Token.belongsTo(User, { foreignKey: 'originalOwnerId', as: 'originalOwner' });

Token.hasMany(Exchange, { foreignKey: 'tokenId', as: 'exchanges' });
Exchange.belongsTo(Token, { foreignKey: 'tokenId', as: 'token' });
Exchange.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Exchange.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

ChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
ChatMessage.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
ChatMessage.belongsTo(Exchange, { foreignKey: 'exchangeId', as: 'exchange' });

module.exports = {
  User,
  Category,
  Product,
  Token,
  Exchange,
  Order,
  OrderItem,
  ChatMessage,
};
