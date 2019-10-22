import { hash, compare } from 'bcrypt-nodejs';
import { bcryptSalt } from '../settings';

export const bcryptHash = async (data: string): Promise<string> => await new Promise((resolve, reject) =>
    hash(data, bcryptSalt, (e, h) => e ? reject(e) : resolve(h)));

export const bcryptCompare = async (data: string, hashedData: string): Promise<boolean> => await new Promise((resolve, reject) =>
    compare(data, hashedData, (e, m) => e ? reject(e) : resolve(m)));
