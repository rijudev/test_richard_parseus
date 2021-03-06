import { Parse } from './parse'
import { IFieldParse, ParseFunction, IParseFunction } from '../utils'
import { Parseus } from '../repository/repository'
import { Field } from '../decorators/fields/field'
import { FieldType } from '../decorators/options/field-options'

export class ArrayParse<T> extends Parse<T> {
  constructor(model: T, metadata: IFieldParse, parser?: ParseFunction) {
    super(model, metadata, parser)
    this.parseArray = this.parseArray.bind(this)
  }

  protected getFieldTypes(): ParseFunction {
    return {
      array: this.parseArray
    }
  }

  private parseSimpleArray(acc: any[], item: any) {
    return function({ key, value, options }: IParseFunction) {
      class InnerClasss {
        @Field({
          type: typeof (options.factory as Function)() as FieldType,
          factory: options.factory!
        })
        value: any
      }
      const newValue = Parseus.decode({ value: item }).to(InnerClasss)
      acc.push(newValue.value)
      return acc
    }
  }

  private parseArray(opts: IParseFunction) {
    const { value, options, isEncoding } = opts
    if (!Array.isArray(value)) return []
    const newModel = value.reduce((acc: any[], item: any) => {
      if (typeof item !== 'object') {
        return this.parseSimpleArray(acc, item)(opts)
      }

      const newValue = isEncoding
        ? Parseus.encode(item, options.factory)
        : Parseus.decode(item).to(options.factory!)
      acc.push(newValue)
      return acc
    }, [])

    return newModel
  }
}
