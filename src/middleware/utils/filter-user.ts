import { JwtPayload } from "jsonwebtoken";
import { User } from "../../data/user";
import { Request } from "express";

export const filterUser = ( filter: JwtPayload, req: Request ) => {
    const user: any = (User.filter(( item ) => {
        if( item.id == filter.id ){
            return item;
        }
    }) || [ false ])[ 0 ];
    return user;
}