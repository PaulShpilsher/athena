import { sign, verify, VerifyErrors } from 'jsonwebtoken';
import { Identity } from '../models/identity.interface';
import { jwtSecret, jwtExpirationSeconds } from '../settings';

export const makeAuthToken = async (identity: Identity): Promise<string> => new Promise<string>((resolve, reject) =>
    sign(identity, jwtSecret, {
        issuer: 'athena',
        algorithm: 'HS512',
        encoding: 'utf8',
        expiresIn: Math.floor(Date.now() / 1000) + jwtExpirationSeconds
    }, (err: Error, encoded: string) => !err ? resolve(encoded) : reject(err)));

export const verifyAuthToken = async (token: string): Promise<Identity> => new Promise((resolve, reject) =>
    verify(token, jwtSecret, {
        algorithms: ['HS512'],
        issuer: 'athena'
    }, (err: VerifyErrors, decoded: Identity) => !err ? resolve(decoded) : reject(err)));
