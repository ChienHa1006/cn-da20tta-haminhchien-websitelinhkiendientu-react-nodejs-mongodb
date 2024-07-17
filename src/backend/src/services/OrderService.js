const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./JwtService");
const Order = require("../models/OrderProduct");
const Product = require("../models/ProductModel");
const EmailService = require("../services/EmailService")

const createOrder = (newOrder) => {
    return new Promise(async (resolve, reject) => {
        const { orderItems, paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone, user, isPaid, paidAt, email } = newOrder;
        try {
            const stockCheckPromises = orderItems.map(async (order) => {
                const productData = await Product.findOneAndUpdate({
                    _id: order.product,
                    countInStock: { $gte: order.amount }
                }, {
                    $inc: {
                        countInStock: -order.amount,
                        selled: +order.amount
                    }
                }, { new: true });
                return { productData, order };
            });

            const stockResults = await Promise.all(stockCheckPromises);

            const outOfStockItems = stockResults.filter(result => !result.productData);

            if (outOfStockItems.length) {
                const outOfStockIds = outOfStockItems.map(item => item.order.product);
                resolve({
                    status: 'ERR',
                    message: `Sản phẩm với id ${outOfStockIds.join(',')} không đủ hàng`,
                });
                return;
            }

            const createdOrder = await Order.create({
                orderItems,
                shippingAddress: {
                    fullName,
                    address,
                    city,
                    phone
                },
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
                user: user,
                isPaid,
                paidAt,
            });
            if (createdOrder) {
                await EmailService.sendEmailCreateOrder(email, orderItems)
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                });
            } else {
                resolve({
                    status: 'ERR',
                    message: 'Không thể tạo đơn hàng',
                });
            }
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};


const getAllOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.find({
                user: id
            });

            if (order === null) {
                resolve({
                    status: 'OK',
                    message: 'The product is not defined'
                });
                return;
            }
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: order
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const getDetailsOrder = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findById({
                _id: id
            });

            if (order === null) {
                resolve({
                    status: 'OK',
                    message: 'The product is not defined'
                });
                return;
            }
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: order
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};


const cancelOrderDetails = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findByIdAndDelete(id)
            if (order === null) {
                resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                });
            }


            // Cập nhật tồn kho cho từng sản phẩm trong đơn hàng
            const updateStockPromises = order.orderItems.map(async (orderItem) => {
                const productData = await Product.findByIdAndUpdate(orderItem.product, {
                    $inc: {
                        countInStock: orderItem.amount,
                        selled: -orderItem.amount
                    }
                }, { new: true });
                return productData;
            });

            const updateResults = await Promise.all(updateStockPromises);

            // Kiểm tra kết quả cập nhật tồn kho
            const failedUpdates = updateResults.filter(result => !result);
            if (failedUpdates.length) {
                resolve({
                    status: 'ERR',
                    message: `Sản phẩm với id ${failedUpdates.map(item => item._id).join(',')}không tồn tại`,
                });
                return;
            }

            resolve({
                status: 'OK',
                message: 'Delete order success',
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const getAllOrder = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allOrder = await Order.find()
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allOrder
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};


module.exports = {
    createOrder,
    getAllOrderDetails,
    getDetailsOrder,
    cancelOrderDetails,
    getAllOrder
};