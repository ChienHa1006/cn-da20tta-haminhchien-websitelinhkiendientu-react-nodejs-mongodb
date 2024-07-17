const Product = require("../models/ProductModel");

const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const { name, image, type, price, countInStock, rating, description, discount } = newProduct
        try {
            const checkProduct = await Product.findOne({ name: name });

            if (checkProduct !== null) {
                resolve({
                    status: 'FAILED',
                    message: 'The name of product is already'
                });
                return;
            }

            const createProduct = await Product.create({
                name,
                image,
                type,
                price,
                countInStock: Number(countInStock),
                rating,
                description,
                discount: Number(discount),
            });

            if (createProduct) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createProduct
                });
            }
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const updateProduct = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findOne({
                _id: id
            });

            if (checkProduct === null) {
                resolve({
                    status: 'OK',
                    message: 'The product is not defined'
                });
                return;
            }
            const updateProduct = await Product.findByIdAndUpdate(id, data, { new: true })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                date: updateProduct
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const deleteProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findOne({
                _id: id
            });

            if (checkProduct === null) {
                resolve({
                    status: 'OK',
                    message: 'The product is not defined'
                });
                return;
            }
            await Product.findByIdAndDelete(id)
            resolve({
                status: 'OK',
                message: 'Delete product success',
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const deleteManyProduct = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {

            await Product.deleteMany({ _id: ids })
            resolve({
                status: 'OK',
                message: 'Delete product success',
            });
        } catch (e) {
            reject(e);
        }
    });
};

const getAllProduct = (limit, page, sort, filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            const query = {};

            // Áp dụng bộ lọc
            if (filter) {
                const label = filter[0];
                query[label] = { '$regex': filter[1], '$options': 'i' };
            }

            const totalProduct = await Product.countDocuments(query);

            let productsQuery = Product.find(query).skip(page * limit).limit(limit);

            // Áp dụng sắp xếp
            if (sort) {
                const objectSort = {};
                objectSort[sort[1]] = sort[0];
                productsQuery = productsQuery.sort(objectSort);
            }

            const allProduct = await productsQuery;

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allProduct,
                totalItems: totalProduct,
                pageCurrent: Number(page + 1),
                totalPage: Math.ceil(totalProduct / limit)
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const getAllType = () => {
    return new Promise(async (resolve, reject) => {
        try {

            const allType = await Product.distinct('type')
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allType,
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const getDetailsProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findOne({
                _id: id
            });

            if (product === null) {
                resolve({
                    status: 'OK',
                    message: 'The product is not defined'
                });
                return;
            }
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: product
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};



module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProduct,
    getDetailsProduct,
    deleteManyProduct,
    getAllType,
};