# Writing practice

The reference trace defines the target letter form. The learner's whole attempt is assessed only on Check; gesture order, direction, and repeated tracing do not matter. All ink and assessment state are temporary and local.

The use-case helper `use-case/tracing/helpers/assessment.ts`, exported through the use-case index, uses a fixed 200-cell grid across each lesson dimension to count unique geometric ink, independent of event sampling and retracing. It checks reference coverage and stray ink separately. Initial margins are provisional: a 4% proximity corridor, up to 8% uncovered reference cells, and stray cells up to 6% of reference occupancy. These values are not calibrated handwriting standards. Off-pad ink cannot be hidden by clipping.

The page is the feature's external UI wiring. No database, upload, or cloud resource needs cleanup if the feature is removed. Run the repository's check, test, and build commands; page-level browser tests and pure comparison tests are the agreed behaviour seams.
