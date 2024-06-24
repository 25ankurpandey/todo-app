import { expect } from 'chai';
import sinon from 'sinon';
import { TaskService } from '../../src/services/TaskService';
import { TaskDal, UserDal } from '../../src/repositories';
import { Logger } from '../../src/utils/logging/Logger';
import { ReqContextManager } from '../../src/utils/context/ReqContextManager';
import { Constants } from '../../src/constants/Constants';
import { Priority, Status } from '../../src/interfaces/Task';
import * as utils from '../../src/utils/util';
import { ContextManager } from '../../src/utils/context/ContextManager';
sinon.stub(Logger);
sinon.stub(ContextManager);

describe('TaskService', () => {
    let taskService;
    let taskDalStub;
    let userDalStub;

    beforeEach(() => {
        taskDalStub = sinon.createStubInstance(TaskDal);
        userDalStub = sinon.createStubInstance(UserDal);
        taskService = new TaskService(taskDalStub, userDalStub);
        sinon.stub(Logger, 'info');
        sinon.stub(Logger, 'error');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('fetchAndFilterAndSortTasks', () => {
        it('should fetch and filter tasks correctly', async () => {
            const filters = { page_no: 1, page_size: 10, status: 'pending' };
            const tasks = [{ id: 1, name: 'Test Task' }];
            const pagination = { limit: 10, offset: 0 };
            const getPaginationStub = sinon.stub(utils, 'getPagination').returns(pagination);
            taskDalStub.getTasks.resolves(tasks);

            const result = await taskService.fetchAndFilterAndSortTasks(filters);

            expect(result).to.eql(tasks);
            expect(taskDalStub.getTasks.calledOnce).to.be.true;
            sinon.assert.calledOnceWithExactly(getPaginationStub, 0, 10);
        });

        it('should handle errors', async () => {
            const filters = { page_no: 1, page_size: 10, status: 'pending' };
            const error = new Error('Test Error');
            taskDalStub.getTasks.rejects(error);

            try {
                await taskService.fetchAndFilterAndSortTasks(filters);
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });
    });

    describe('getTaskFiltersAndSortByOptions', () => {
        it('should return filters and sort by options', async () => {
            const result = await taskService.getTaskFiltersAndSortByOptions();

            expect(result).to.eql({
                filter: {
                    status_filter: Object.values(Status),
                    priority_filter: Object.values(Priority)
                },
                sort: {
                    sorting_strategy: Constants.Valid_Sorting_Strategies,
                    sort_by: Constants.Valid_Sort_By_Options
                }
            });
        });

        it('should handle errors', async () => {
            const error = new Error('Test Error');
            sinon.stub(Constants, 'Valid_Sorting_Strategies').throws(error);

            try {
                await taskService.getTaskFiltersAndSortByOptions();
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });
    });

    describe('createTask', () => {
        it('should create a task successfully', async () => {
            const reqBody = { name: 'Test Task' };
            const userId = 1;
            const email = "test@test.com";
            const createdTask = { id: 1, name: 'Test Task', user_id: userId };
            sinon.stub(ReqContextManager, 'getUserMeta').returns({
                id: userId,
                email: email
            });
            taskDalStub.create.resolves(createdTask);

            const result = await taskService.createTask(reqBody);

            expect(result).to.eql(createdTask);
            expect(taskDalStub.create.calledOnceWith({ name: 'Test Task', user_id: userId })).to.be.true;
        });

        it('should handle errors', async () => {
            const reqBody = { name: 'Test Task' };
            const error = new Error('Test Error');
            taskDalStub.create.rejects(error);

            try {
                await taskService.createTask(reqBody);
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });
    });

    describe('updateTask', () => {
        it('should update a task successfully', async () => {
            const reqBody = { id: 1, name: 'Updated Task' };
            const userId = 1;
            const email = "test@test.com";
            const updatedTask = { id: 1, name: 'Updated Task', user_id: userId };
            sinon.stub(ReqContextManager, 'getUserMeta').returns({
                id: userId,
                email: email
            });
            taskDalStub.checkIfTaskExists.resolves(true);
            taskDalStub.update.resolves(updatedTask);

            const result = await taskService.updateTask(reqBody);

            expect(result).to.eql(updatedTask);
            expect(taskDalStub.update.calledOnceWith({ id: 1, name: 'Updated Task', user_id: userId })).to.be.true;
        });

        it('should handle errors', async () => {
            const reqBody = { id: 1, name: 'Updated Task' };
            const error = new Error('Test Error');
            taskDalStub.checkIfTaskExists.resolves(true);
            taskDalStub.update.rejects(error);

            try {
                await taskService.updateTask(reqBody);
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });

        it('should throw error if task does not exist', async () => {
            const reqBody = { id: 1, name: 'Updated Task' };
            const userId = 1;
            const email = "test@test.com";
            sinon.stub(ReqContextManager, 'getUserMeta').returns({
                id: userId,
                email: email
            });
            taskDalStub.checkIfTaskExists.resolves(false);

            try {
                await taskService.updateTask(reqBody);
            } catch (e) {
                expect(e.message).to.equal("Task doesn't exist");
                expect(taskDalStub.update.called).to.be.false;
            }
        });
    });

    describe('deleteTask', () => {
        it('should delete a task successfully', async () => {
            const taskId = 1;
            taskDalStub.checkIfTaskExists.resolves(true);
            taskDalStub.delete.resolves({ success: true });

            const result = await taskService.deleteTask(taskId);

            expect(result).to.eql({ success: true });
            expect(taskDalStub.delete.calledOnceWith(taskId)).to.be.true;
        });

        it('should handle errors', async () => {
            const taskId = 1;
            const error = new Error('Test Error');
            taskDalStub.checkIfTaskExists.resolves(true);
            taskDalStub.delete.rejects(error);

            try {
                await taskService.deleteTask(taskId);
            } catch (e) {
                expect(e.message).to.equal('SYSTEM_ERR');
            }
        });

        it('should throw error if task does not exist', async () => {
            const taskId = 1;
            taskDalStub.checkIfTaskExists.resolves(false);

            try {
                await taskService.deleteTask(taskId);
            } catch (e) {
                expect(e.message).to.equal("Task doesn't exist");
                expect(taskDalStub.delete.called).to.be.false;
            }
        });
    });
});
