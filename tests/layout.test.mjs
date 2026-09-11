import test from 'node:test';
import assert from 'node:assert/strict';
import { fitLive2DToScreen } from '../adapters/p2g/layout.mjs';

test('screen fitting is invariant to DPI and repeated resize', () => {
  const model={scale:{x:1,y:1,set(s){this.x=this.y=s;}},anchor:{set(){}},get width(){return 1000*this.scale.x;},get height(){return 2000*this.scale.y;}};
  for(const dpr of [1,1.5,2]) {
    const renderer={width:800*dpr,height:600*dpr,screen:{width:800,height:600}};
    for(let i=0;i<3;i++){
      const result=fitLive2DToScreen(model,renderer);
      assert.equal(result.x,400);assert.equal(result.y,576);
      assert.ok(Math.abs(result.height-552)<1e-8);
    }
  }
});
