import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'Match_Between_Fields', async: false })
export class MatchBetweenFields<
  T = any,
> implements ValidatorConstraintInterface {
  validate(value: T, args: ValidationArguments) {
    const [property] = args.constraints as [string];
    const obj = args.object as Record<string, any>;
    return obj[property] === value;
  }

  defaultMessage(args: ValidationArguments) {
    console.log({ args });
    return `Fail to match between ${args.property} with ${args.constraints[0]}`;
  }
}

export function IsMatch(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (
    object: object,
    propertyName: string,
  ) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchBetweenFields,
    });
  };
}

