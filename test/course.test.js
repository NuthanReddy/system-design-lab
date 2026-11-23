import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chapters, lessons, resolveRoute, chapterFor, stepChanges } from '../src/course.js';
import { diagram } from '../src/diagram.js';

test('all forty course entries have original, navigable walkthroughs', () => {
  const ids = chapters.flatMap(c => c.lessons);
  assert.equal(ids.length, 40);
  assert.equal(new Set(ids).size, 40);
  for (const id of ids) {
    const lesson = lessons[id];
    assert.ok(lesson, id);
    assert.ok(lesson.steps.length >= 4, id);
    assert.equal(chapterFor(id).lessons.includes(id), true);
    const nodes = new Set(lesson.nodes.map(n => n.id));
    for (const step of lesson.steps) {
      assert.ok(step.title && step.body.length && step.idea, `${id}: complete explanation`);
      step.visible.forEach(n => assert.ok(nodes.has(n), `${id}: known component`));
      step.edges.forEach(([from, to]) => {
        assert.ok(step.visible.includes(from) && step.visible.includes(to), `${id}: both endpoints visible`);
      });
    }
  }
});

test('URL shortener evolves from a brief to a complete, eight-component system', () => {
  const lesson = lessons['design-url-shortener'];
  assert.equal(lesson.steps.length, 12);
  assert.equal(lesson.steps[0].visible.length, 2);
  assert.equal(lesson.steps[6].visible.includes('cache'), true);
  assert.equal(lesson.steps.at(-1).visible.length, 8);
  const svg = diagram(lesson, lesson.steps.at(-1), 11);
  assert.match(svg, /animateMotion/);
  assert.match(svg, /Rate limiter/);
  assert.match(svg, /Click events/);
  assert.doesNotMatch(svg, /NaN|undefined/);
  const recap = lesson.steps.at(-1);
  for (const [from, to] of [['service', 'ids'], ['service', 'store'], ['cache', 'service'], ['store', 'service'], ['service', 'people']]) {
    assert.ok(recap.edges.some(edge => edge[0] === from && edge[1] === to), `${from} → ${to} is traceable in recap`);
  }
});

test('step changes describe actual diagram differences without repeating the key idea', () => {
  const lesson = lessons['design-url-shortener'];
  const cache = stepChanges(lesson, 6).join(' ');
  assert.match(cache, /Added components: Cache/);
  assert.match(cache, /Cache → Link API \(response\)/);
  assert.match(cache, /Removed paths:/);
  assert.notEqual(cache, lesson.steps[6].idea);
  assert.match(stepChanges(lessons['load-balancing'], 4).join(' '), /Topology unchanged. Focus: Avoid a single point/);
  assert.deepEqual(stepChanges(lesson, 0), []);
});

test('all diagrams have finite geometry and meaningful accessible labels', () => {
  for (const lesson of Object.values(lessons)) {
    lesson.steps.forEach((step, index) => {
      const svg = diagram(lesson, step, index);
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/, `${lesson.id}/${index + 1}`);
      assert.match(svg, /aria-label="/);
    });
  }
});

test('routing diagrams do not forward requests through DNS or sibling backends', () => {
  const request = lessons['request-lifecycle'].steps.at(-1).edges;
  assert.ok(request.some(([from, to]) => from === 'n0' && to === 'n2'));
  assert.ok(!request.some(([from, to]) => from === 'n1' && to === 'n2'));
  const balanced = lessons['load-balancing'].steps.at(-1).edges;
  assert.ok(balanced.some(([from, to]) => from === 'n1' && to === 'n3'));
  assert.ok(!balanced.some(([from, to]) => from === 'n2' && to === 'n3'));
  const cache = lessons.caching.steps.at(-1).edges;
  assert.ok(cache.some(([from, to, type]) => from === 'n1' && to === 'n3' && type === 'miss'));
});

test('route parsing clamps steps and safely resolves unknown routes', () => {
  assert.equal(resolveRoute('#/caching/3').index, 2);
  assert.equal(resolveRoute('/caching/3').lesson.id, 'caching');
  assert.equal(resolveRoute('/caching/3').index, 2);
  assert.equal(resolveRoute('#/caching/-8').index, 0);
  assert.equal(resolveRoute('#/caching/999').index, 4);
  assert.equal(resolveRoute('#/caching/2.4').index, 0);
  assert.equal(resolveRoute('#/missing/1').lesson.id, 'design-url-shortener');
  assert.equal(resolveRoute('').index, 0);
});
