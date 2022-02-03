import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        // Create a fake copy of the users service
        fakeUsersService = {
            find: () => Promise.resolve([]),
            create: (email: string, password: string) => Promise.resolve({ id: 1, email, password } as User)
        };

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }
            ]
        }).compile();

        service = module.get(AuthService);
    });

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('asdf@asdf.com', 'asdf');

        expect(user.password).not.toEqual('asdf');
        const [salt, hash] = user.password.split('');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async (done) => {
        fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);

        try {
            await service.signup('asdf@asdf.com', 'asdf');
        } catch (err) {
            done();
        }
    });

    it('throws if signin is called with an unused email', async (done) => {
        try {
            await service.signin('wqewqe@weqewq.ewq', 'wqewq');
        } catch (err) {
            done();
        }
    });


    it('throws if an invalid password is provided', async (done) => {
        fakeUsersService.find = () => Promise.resolve([{ email: 'qweqeq@weqe.qwe', password: 'qdwqdq' } as User]);

        try {
            await service.signin('wqewq@ewwwqe.wqe', 'weqewqeq');
        } catch (err) {
            done();
        }
    });

    it('returns a user if correct password is provided', async (done) => {
        fakeUsersService.find = () => Promise.resolve([{ email: 'asdf@asdf.com', password: '1f3f1f78b727fa56.af7186ab0d0a8e9cf1ae2c5c19784947a2fe349d3a3e82f6422c0d7cbc2f925' } as User]);

        const user = await service.signin('asdf@asdf.com', 'mypassword');

        expect(user).toBeDefined();
    })
});