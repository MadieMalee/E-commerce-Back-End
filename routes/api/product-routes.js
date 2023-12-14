const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    // find all products including associated Category and Tag data
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    // find a single product by its `id` including associated Category and Tag data
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  Product.create({
  product_name: req.body.product_name,
  price: req.body.price,
  stock: req.body.stock,
  category_id: req.body.category_id,
  tagIds: req.body.tagIds
  })
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', async (req, res) => {
  try {
    // Update product data
    const [rowsUpdated, [updatedProduct]] = await Product.update(req.body, {
      where: { id: req.params.id },
      returning: true // Get the updated row
    });

    if (rowsUpdated === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.body.tagIds && req.body.tagIds.length) {
      const currentProductTags = await ProductTag.findAll({
        where: { product_id: req.params.id }
      });

      const currentTagIds = currentProductTags.map(({ tag_id }) => tag_id);
      const newTagIds = req.body.tagIds.filter((tagId) => !currentTagIds.includes(tagId));
      const deletedTagIds = currentTagIds.filter((tagId) => !req.body.tagIds.includes(tagId));

      await ProductTag.destroy({
        where: {
          product_id: req.params.id,
          tag_id: deletedTagIds
        }
      });

      const productTagBulkCreate = newTagIds.map((tagId) => ({
        product_id: req.params.id,
        tag_id: tagId
      }));

      await ProductTag.bulkCreate(productTagBulkCreate);
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json(err);
  }
});

// delete one product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.destroy({
      where: { id: req.params.id }
    });
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;