import User from '../mongoose/models/User';
import bcrypt from 'bcrypt';
import CONSTANTS from '../util/constants';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/keys';

// Add a user to the database
async function createUser({ username, email, password, onSuccess, onError }) {
    const saltRounds = CONSTANTS.SALT_ROUNDS;
    const hash = await bcrypt.hash(password, saltRounds);

    try {
        const user:any = await User.create({
            username,
            email,
            password: hash
        });

        const payload = { id: user._id, username };

        jwt.sign(payload, jwtSecret, { expiresIn: '7d' }, (err, token) => {
            if (err) {
                onError("Error signing JWT.");
            } else {
                onSuccess(token);
            }
        });

    } catch (err) {
        onError("Error creating user.");
    }
}

// Delete a user from the database
async function deleteUser({ id, username, email, onSuccess, onError }) {
    const query: any = {};
    if (id) query.id = id;
    else if (username) query.username = username;
    else if (email) query.email = email;

    try {
        await User.findOneAndDelete(query);
        onSuccess();
    } catch (err) {
        onError("Error deleting user.");
    }
}


interface EditUserArgs {
    id?: string;
    username?: string;
    email?: string;
    userData: object;
    onSuccess: (user) => void;
    onError: (error: string) => void;
}
// Edit a user from the database
async function editUser({ id, username, email, userData, onSuccess, onError }: EditUserArgs) {
    const query: any = {};
    if (id) query.id = id;
    else if (username) query.username = username;
    else if (email) query.email = email;

    try {

        const options = { new : true }; // Returns the update document
        const user = await User.findOneAndUpdate(query, { ...userData, updated: Date.now()}, options).exec();

        onSuccess(user);
    } catch (err) {
        onError("Error editing user.");
    }
}

interface FindUserArgs {
    /** _id field of User document. **/
    id?: string;
    /** username field of User document. **/
    username?: string;
    /** email field of User document. **/
    email?: string;
    /** Space-separated string of fields to return in the User document. **/
    selectProps?: string;
}

async function findUser({ id, username, email, selectProps }: FindUserArgs) {
    const query: any = {};
    if (id) query.id = id;
    else if (username) query.username = username;
    else if (email) query.email = email;

    const user: any = await User.findOne(query, selectProps).exec();

    return user;
}

export {
    createUser,
    deleteUser,
    editUser,
    findUser
}