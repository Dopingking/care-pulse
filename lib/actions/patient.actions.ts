
"use server";


let Query: typeof import('node-appwrite').Query;
let users: typeof import('../appwrite.config').users;
let ID: typeof import ('node-appwrite').ID
import { parseStringify } from '../utils';
// import { ID } from 'node-appwrite';

if (typeof window === 'undefined') {
  const appwrite = require('node-appwrite');
  const appwriteConfig = require('../appwrite.config');
  
  Query = appwrite.Query;
  users = appwriteConfig.users;
  ID = appwrite.ID
}


export const createUser = async (user: CreateUserParams) => {
    try {
      const newUser = await users.create(
        ID.unique(),
        user.email, 
        user.phone, 
        undefined, 
        user.name
      );
  
      return parseStringify(newUser);
    } catch (error: any) {
      console.log("Error object:", error); 
  
      if (error && error?.code === 409) { 
        const existingUser = await users.list([
          Query.equal('email', [user.email]),
        ]);
        return existingUser?.users[0];
      }
  
      console.error("An error occurred while creating a new user:", error);
    }
  };
  
export const getUser =async (userId: string) =>{  
  try {
      const user = await users.get(userId);

      return parseStringify(user);
  } catch (error) {
    console.log(error)
  }
}