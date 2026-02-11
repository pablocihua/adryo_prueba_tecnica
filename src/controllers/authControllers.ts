import { loadEnvFile } from 'node:process';

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../data/user';
import { saveHistory } from '../repositories/history.repository';

loadEnvFile();
const generateToken = (id: string, fullname: string, role: string ): string => {
    let expires = process.env.JWT_EXPIRE ? process.env.JWT_EXPIRE : "1d";
    const expiresIn: any = { expiresIn: expires}
    return jwt.sign(
        { id, fullname, role },
        process.env.JWT_SECRET as string,
        expiresIn
        // { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
export const login = async (
    req: Request,
    res: Response
): Promise< void > => {
    let status = 200;
    let message = null;
    let response = {};

    try {
        const { fullname, password } = req.body;
        const user = (User.filter( item => {
            if( item.fullname == fullname && item.password == password ){
                return item;
            }
        }) || [false])[ 0 ];

        if (!user) {
            status = 404;
            message = "Usuario no encontrado";
        }
        
        if (user.password !== password) {
            status = 400;
            message = "Contraseña incorrecta";
        }
        // Verificar password
        // const isPasswordMatch = await bcrypt.compare(user.password, password);
        // if( !isPasswordMatch ){

        if( user.password !== password ){
            status = 401;
            message = 'Credentias invalidates';
        }
        // Generar token
        // let expires = process.env.JWT_EXPIRE ? process.env.JWT_EXPIRE : "1d";
        // const expiresIn: any = { expiresIn: expires}
        if( status == 200 ){
            const token = generateToken( user.id.toString(), fullname, user.role );
            response = {... { success: true, token, user: {
                id: user.id,
                fullname: user.fullname,
                role: user.role
            } }};
        }

        if( message ){
            response = {...{ message }};
        }
    } catch( error: any ){
        await saveHistory({
            log: JSON.stringify({
                file: 'controller.auth.loign',
                case: 'catch',
                message: error.message,
            }),
            createdBy: 0
        });
        message = "Invalid token or expired. Error Not Login"
        status = 401;
        if( message ) response = { ... { message }}
    }

    res.status(status).json( response );
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user
    const user = User.map(( item ) => {
            if( item.id == id ){
                return item;
            }

            return [false];
    })[ 0 ];

    res.status(200).json({
        success: true,
        user: {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            role: user?.role
        }
    });
  } catch (error: any) {
    res.status(500).json({
        success: false,
        message: 'Error al obtener usuario',
        error: error.message
    });
  }
};