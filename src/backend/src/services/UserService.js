const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./JwtService");


const createUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { name, email, password, confirmPassword, phone } = newUser;

        try {
            const checkUser = await User.findOne({ email: email });

            if (checkUser !== null) {
                resolve({
                    status: 'ERR',
                    message: 'Email đã tồn tại'
                });
                return;
            }

            const hash = bcrypt.hashSync(password, 10)
            const createUser = await User.create({
                name,
                email,
                password: hash,
                phone
            });

            if (createUser) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createUser
                });
            }
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const loginUser = (userLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password } = userLogin;

        try {
            const checkUser = await User.findOne({ email: email });

            if (checkUser === null) {
                resolve({
                    status: 'ERR',
                    message: 'Người dùng không tồn tại'
                });
                return;
            }
            const comparePassword = bcrypt.compareSync(password, checkUser.password)
            if (!comparePassword) {
                resolve({
                    status: 'ERR',
                    message: 'Mật khẩu hoặc người dùng không chính xác'
                });
                return;
            }
            const access_token = await generalAccessToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin,
            })
            const refresh_token = await generalRefreshToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin,
            })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                access_token,
                refresh_token
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const updateUser = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                _id: id
            });

            if (checkUser === null) {
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                });
                return;
            }
            if (data.password) {
                data.password = bcrypt.hashSync(data.password, 10);
            }
            const updatedUser = await User.findByIdAndUpdate(id, data, { new: true })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                date: updatedUser
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const deleteUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                _id: id
            });

            if (checkUser === null) {
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                });
                return;
            }
            await User.findByIdAndDelete(id)
            resolve({
                status: 'OK',
                message: 'Delete user success',
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const deleteManyUser = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {
            await User.deleteMany({ _id: ids })
            resolve({
                status: 'OK',
                message: 'Delete user success',
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUser = await User.find()
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allUser
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

const getDetailsUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({
                _id: id
            });

            if (user === null) {
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                });
                return;
            }
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: user
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};




module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser,
    deleteManyUser,
};