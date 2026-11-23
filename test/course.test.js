import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chapters, lessons, resolveRoute, chapterFor } from '../src/course.js';
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

test('route parsing clamps steps and safely resolves unknown routes', () => {
  assert.equal(resolveRoute('#/caching/3').index, 2);
  assert.equal(resolveRoute('#/caching/-8').index, 0);
  assert.equal(resolveRoute('#/caching/999').index, 4);
  assert.equal(resolveRoute('#/caching/2.4').index, 0);
  assert.equal(resolveRoute('#/missing/1').lesson.id, 'design-url-shortener');
  assert.equal(resolveRoute('').index, 0);
});
