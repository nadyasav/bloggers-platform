export class UserAlreadyExistsError extends Error {
  readonly duplicateField: string;

  constructor(duplicateField: string) {
    super(`${duplicateField} should be unique`);
    this.name = 'UserAlreadyExistsError';
    this.duplicateField = duplicateField;
  }
}
