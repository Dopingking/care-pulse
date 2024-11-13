"use server";


let Query: typeof import('node-appwrite').Query;
let users: typeof import('../appwrite.config').users;
let ID: typeof import ('node-appwrite').ID
let InputFile: typeof import ('node-appwrite').InputFile;
let storage: typeof import ('../appwrite.config').storage;
let databases: typeof import ('../appwrite.config').databases;
let BUCKET_ID: typeof import ('../appwrite.config').BUCKET_ID;
let DATABASE_ID: typeof import ('../appwrite.config').DATABASE_ID;
let ENDPOINT: typeof import ('../appwrite.config').ENDPOINT;
let PATIENT_COLLECTION_ID: typeof import ('../appwrite.config').PATIENT_COLLECTION_ID;
let PROJECT_ID: typeof import ('../appwrite.config').PROJECT_ID;

import { parseStringify } from '../utils';


if (typeof window === 'undefined') {
  const appwrite = require('node-appwrite');
  const appwriteConfig = require('../appwrite.config');
  
  Query = appwrite.Query;
  users = appwriteConfig.users;
  ID = appwrite.ID
  InputFile = appwrite.InputFile
  databases = appwrite.databases
  storage = appwrite.storage
  BUCKET_ID = appwrite.BUCKET_ID
  DATABASE_ID = appwrite.DATABASE_ID
  ENDPOINT = appwrite.ENDPOINT
  PATIENT_COLLECTION_ID = appwrite.PATIENT_COLLECTION_ID
  PROJECT_ID = appwrite.PROJECT_ID
  
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

export const registerPatient = async ({identificationDocument, ...patient}: RegisterUserParams) =>{
  try {
    let file;

    if(identificationDocument){
      const inputFile = InputFile.fromBuffer(
        identificationDocument?.get('blobFile') as Blob,
        identificationDocument?.get('fileName') as string,
      )

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile)
    }


    console.log(

      {
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        ...patient
      }
    )

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID,
      ID.unique(),
      {
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        ...patient
      }
    )

    return parseStringify(newPatient);
    
  } catch (error) {
      console.log(error);
  } 
}