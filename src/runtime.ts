import { IDUtil, Runtime } from '@lib'

import { SimulatedCollection } from './lib/builtin/data/SimulatedCollection'
import { SimulatedDataPresets } from './lib/builtin/data/SimulatedDataPresets'
import { basicExampleSnippet } from 'examples/basics'

new Runtime('PROD').runSnippet(basicExampleSnippet);
