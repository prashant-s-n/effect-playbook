import {test, describe, expect} from 'bun:test';
import { add } from '.';

describe('add',  () => {
    test('should add numbers', () =>{
        expect(add(1,2)).toBe(3)
    })
})