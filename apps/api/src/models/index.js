'use strict';

const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Token = require('./Token');
const Exchange = require('./Exchange');
const { Order, OrderItem } = require('./Order');
const ChatMessage = require('./ChatMessage');
const Post = require('./Post');
const PostLike = require('./PostLike');
const PostComment = require('./PostComment');
const Friendship = require('./Friendship');
const Notification = require('./Notification');
const Policy = require('./Policy');

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

// Posts + likes + comments
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Post.belongsTo(User, { foreignKey: 'withUserId', as: 'withUser' });
Post.hasMany(PostLike, { foreignKey: 'postId', as: 'likes', onDelete: 'CASCADE' });
Post.hasMany(PostComment, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' });
PostLike.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
PostLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });
PostComment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
PostComment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
PostComment.belongsTo(PostComment, { foreignKey: 'parentId', as: 'parent' });
PostComment.hasMany(PostComment, { foreignKey: 'parentId', as: 'replies' });

// Friendships (relación dirigida; ownership simétrica gestionada en service)
Friendship.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Friendship.belongsTo(User, { foreignKey: 'friendId', as: 'friend' });

// Notifications (recipient)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'recipient' });

module.exports = {
  User,
  Category,
  Product,
  Token,
  Exchange,
  Order,
  OrderItem,
  ChatMessage,
  Post,
  PostLike,
  PostComment,
  Friendship,
  Notification,
  Policy,
};
