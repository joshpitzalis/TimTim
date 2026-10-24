# Assess the finished letter

Assess the learner's finished letter attempt against a reference trace rather than compliance with a prescribed stroke sequence. Each reference trace defines a target letter form; accepting a different letter form requires authoring its own trace. The goal is a forgiving recreation of that example, with stroke order, drawing direction, and number of pen lifts excluded from assessment.

The learner writes over a faint guide and explicitly presses Check to submit the whole letter attempt. Allow small deviations while retaining the guide's approximate size and position; do not automatically recenter or resize the attempt. Repeated passes over the same correct line must not count against the learner merely because the ink becomes darker or thicker.

Require both coverage of the whole reference trace and sufficiently little ink away from it. Substantial missing sections and substantial extra lines fail; tiny gaps and accidental tails may pass. Measuring stray distance alone is insufficient because an incomplete drawing could lie entirely on the guide. The comparison method remains open; distance from the trace is the owner's suggested starting point.

After a failed check, retain the drawing so the learner can add missing parts and check again. Clear discards the attempt and starts again; removing unwanted lines initially requires restarting.

Give a simple textual reason for failure, distinguishing missing parts from drawing too far from the guide. Highlighting individual regions is outside the initial scope. On success, show a success message and retain the drawing until the learner chooses Retry; do not reset or advance automatically. The first version uses one reference trace.

Any new drawing clears the previous assessment result. The learner must press Check again to assess the changed attempt.

Lean forgiving on borderline attempts: allow wobble, small gaps, and minor tails while rejecting substantial missing parts and extra lines. Calibration against judged handwriting examples is explicitly deferred. Initial numerical tolerances remain provisional implementation choices, not validated handwriting standards.

This replaces the next-stroke assessment direction in the existing specification. The owner confirmed the resulting specification and its proposed test seams on 2026-10-24. The specification is published as [issue #7](https://github.com/joshpitzalis/TimTim/issues/7) with the ready-for-agent label.
