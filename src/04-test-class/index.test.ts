import _ from 'lodash';

import {
  getBankAccount,
  InsufficientFundsError,
  SynchronizationFailedError,
  TransferFailedError,
} from '.';

describe('BankAccount', () => {
  const initialBalance = 100;

  test('should create account with initial balance', () => {
    const bankAccount = getBankAccount(initialBalance);

    expect(bankAccount.getBalance()).toBe(initialBalance);
  });

  test('should throw InsufficientFundsError error when withdrawing more than balance', () => {
    const bankAccount = getBankAccount(initialBalance);
    const moneyToWithdraw = initialBalance + 100;

    expect(() => bankAccount.withdraw(moneyToWithdraw)).toThrow(
      new InsufficientFundsError(initialBalance),
    );
  });

  test('should throw error when transferring more than balance', () => {
    const bankAccount = getBankAccount(initialBalance);
    const moneyToTransfer = initialBalance + 100;
    const accountToTransfer = getBankAccount(initialBalance);

    expect(() =>
      bankAccount.transfer(moneyToTransfer, accountToTransfer),
    ).toThrow(new InsufficientFundsError(initialBalance));
  });

  test('should throw error when transferring to the same account', () => {
    const bankAccount = getBankAccount(initialBalance);
    const moneyToTransfer = initialBalance - 50;

    expect(() => bankAccount.transfer(moneyToTransfer, bankAccount)).toThrow(
      new TransferFailedError(),
    );
  });

  test('should deposit money', () => {
    const bankAccount = getBankAccount(initialBalance);
    bankAccount.deposit(100);

    expect(bankAccount.getBalance()).toBe(200);
  });

  test('should withdraw money', () => {
    const bankAccount = getBankAccount(initialBalance);
    bankAccount.withdraw(50);

    expect(bankAccount.getBalance()).toBe(50);
  });

  test('should transfer money', () => {
    const bankAccount = getBankAccount(initialBalance);
    const accountToTransfer = getBankAccount(120);
    bankAccount.transfer(20, accountToTransfer);

    expect(bankAccount.getBalance()).toBe(80);
    expect(accountToTransfer.getBalance()).toBe(140);
  });

  test('fetchBalance should return number in case if request did not failed', async () => {
    jest.spyOn(_, 'random').mockReturnValue(1);

    const bankAccount = getBankAccount(initialBalance);

    const balance = await bankAccount.fetchBalance();

    expect(balance).not.toBeNull();
  });

  test('should set new balance if fetchBalance returned number', async () => {
    jest.spyOn(_, 'random').mockReturnValue(40);

    const bankAccount = getBankAccount(initialBalance);

    await bankAccount.synchronizeBalance();

    expect(bankAccount.getBalance()).toBe(40);
  });

  test('should throw SynchronizationFailedError if fetchBalance returned null', async () => {
    jest.spyOn(_, 'random').mockReturnValue(0);

    const bankAccount = getBankAccount(initialBalance);

    await expect(bankAccount.synchronizeBalance()).rejects.toThrow(
      new SynchronizationFailedError(),
    );
  });
});
