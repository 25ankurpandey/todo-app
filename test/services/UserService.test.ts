import { expect } from 'chai';
import sinon from 'sinon';
import { UserService } from '../../src/services/UserService';
import { UserDal } from '../../src/repositories';
import { Logger } from '../../src/utils/logging/Logger';
import { ErrUtils } from '../../src/utils/ErrUtils';
import { hashPassword, validatePassword, generateToken } from '../../src/utils/util';
import { AuthenticationMiddleware } from '../../src/utils/middleware/AuthenticationMiddleware';
sinon.stub(Logger);

describe('UserService', () => {
    let userService;
    let userDalStub;

    beforeEach(() => {
        userDalStub = sinon.createStubInstance(UserDal);
        userService = new UserService(userDalStub);
        sinon.stub(Logger, 'info');
        sinon.stub(Logger, 'error');
        sinon.stub(ErrUtils, 'throwSystemError');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('createUser', () => {
        it('should create a user successfully', async () => {
            const reqBody = { email: 'test@example.com', password: 'password123' };
            const user = { id: 1, email: 'test@example.com' };
            const jwtToken = 'token';
            sinon.stub(generateToken).resolves(jwtToken);
            sinon.stub(hashPassword).resolves('hashedpassword123');
            userDalStub.getUserByEmail.resolves(null);
            userDalStub.create.resolves(user);

            const result = await userService.createUser(reqBody);

            expect(result).to.eql({ user: user, jwtToken: jwtToken });
            expect(userDalStub.getUserByEmail.calledOnceWith(reqBody.email)).to.be.true;
            expect(userDalStub.create.calledOnceWith({ ...reqBody, password: 'hashedpassword123' })).to.be.true;
        });

        it('should throw error if user already exists', async () => {
            const reqBody = { email: 'test@example.com', password: 'password123' };
            userDalStub.getUserByEmail.resolves({ id: 1, email: 'test@example.com' });

            try {
                await userService.createUser(reqBody);
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });

        it('should handle errors', async () => {
            const reqBody = { email: 'test@example.com', password: 'password123' };
            const error = new Error('Test Error');
            userDalStub.getUserByEmail.rejects(error);

            try {
                await userService.createUser(reqBody);
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });
    });

    describe('updateUser', () => {
        it('should update a user successfully', async () => {
            const reqBody = { id: 1, email: 'test@example.com', password: 'password123' };
            const updatedUser = { id: 1, email: 'test@example.com' };
            sinon.stub(hashPassword).resolves('hashedpassword123');
            userDalStub.update.resolves(updatedUser);

            const result = await userService.updateUser(reqBody);

            expect(result).to.eql(updatedUser);
            expect(userDalStub.update.calledOnceWith({ ...reqBody, password: 'hashedpassword123' })).to.be.true;
        });

        it('should update a user without changing password if not provided', async () => {
            const reqBody = { id: 1, email: 'test@example.com' };
            const updatedUser = { id: 1, email: 'test@example.com' };
            userDalStub.update.resolves(updatedUser);

            const result = await userService.updateUser(reqBody);

            expect(result).to.eql(updatedUser);
            expect(userDalStub.update.calledOnceWith(reqBody)).to.be.true;
        });

        it('should handle errors', async () => {
            const reqBody = { id: 1, email: 'test@example.com', password: 'password123' };
            const error = new Error('Test Error');
            userDalStub.update.rejects(error);

            try {
                await userService.updateUser(reqBody);
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });
    });

    describe('userLogin', () => {
        it('should log in a user successfully', async () => {
            const reqBody = { email: 'test@example.com', password: 'password123' };
            const user = { id: 1, email: 'test@example.com', password: 'hashedpassword123' };
            const jwtToken = 'token';
            userDalStub.getUserByEmail.resolves(user);
            sinon.stub(validatePassword).resolves(true);
            sinon.stub(generateToken).returns(jwtToken);

            const result = await userService.userLogin(reqBody);

            expect(result).to.eql({ user: user, jwtToken: jwtToken });
            expect(userDalStub.getUserByEmail.calledOnceWith(reqBody.email)).to.be.true;
        });

        it('should throw error if user not found', async () => {
            const reqBody = { email: 'test@example.com', password: 'password123' };
            userDalStub.getUserByEmail.resolves(null);

            try {
                await userService.userLogin(reqBody);
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });

        it('should handle incorrect password', async () => {
            const reqBody = { email: 'test@example.com', password: 'password123' };
            const user = { id: 1, email: 'test@example.com', password: 'hashedpassword123' };
            const error = new Error('wrong password');
            userDalStub.getUserByEmail.resolves(user);
            sinon.stub(validatePassword).rejects(error);

            try {
                await userService.userLogin(reqBody);
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });

        it('should handle other errors', async () => {
            const reqBody = { email: 'test@example.com', password: 'password123' };
            const error = new Error('Test Error');
            userDalStub.getUserByEmail.rejects(error);

            try {
                await userService.userLogin(reqBody);
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });
    });

    describe('userLogout', () => {
        it('should log out a user successfully', async () => {
            const token = 'token';
            sinon.stub(AuthenticationMiddleware, 'removeFromWhitelist').resolves(true);

            const result = await userService.userLogout(token);

            expect(result).to.eql({ success: true });
            expect(AuthenticationMiddleware.removeFromWhitelist.calledOnceWith(token)).to.be.true;
        });

        it('should handle errors', async () => {
            const token = 'token';
            const error = new Error('Test Error');
            sinon.stub(AuthenticationMiddleware, 'removeFromWhitelist').rejects(error);

            try {
                await userService.userLogout(token);
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });
    });
});
