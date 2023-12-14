// import models
const Product = require('./product');
const Category = require('./category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.belongsTo(Category, {
 
});

// Categories have many Products
Category.hasMany(Product, {
 
});

// Products belongToMany Tags (through ProductTag)
Product.belongsToMany(Tag, {
 
});

// Tags belongToMany Products (through ProductTag)
Tag.belongsToMany(Product, {

});

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};

