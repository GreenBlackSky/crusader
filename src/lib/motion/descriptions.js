/* What each exercise is: "how to do it" text, captions that follow the
   animation, and the intent facts the 3D figure is checked against. Wording
   is deliberate; change it only on purpose. Ported verbatim. */

/* ===== Full descriptions: what to do, and what the figure must show ===== */
/* how:    Start / Move / Finish / Watch for, shown to the person
   phases: captions that follow the animation (at = share of one cycle, 0 to 1)
   intent: facts the animation must satisfy, used to set the 3D widths and to check every pose
     planted: parts that touch a surface (hands, hand, feet, foot, forearms, knees, seat, grip)
     meet:    pairs that touch (handR/handL/handAny/elbowAny/kneeAny)
     moves:   the figure must travel at least this far against its own body
     hands/feet/elbows: stance, turned into 3D widths                                        */
const DESC = {
  'pike-pushup': {
    how: [
      [
        'Start',
        'Hands on the floor about shoulder-width apart, feet hip-width, hips lifted high so your body makes an upside-down V. Arms straight.',
      ],
      [
        'Move',
        'Bend your elbows back and slightly out and lower the top of your head toward the floor between your hands. Pause, then press the floor away until your arms are straight.',
      ],
      ['Finish', 'Arms straight, hips still high.'],
      ['Watch for', 'Keep your hips high the whole time. Your elbows track back, not wide.'],
    ],
    phases: [
      [0, 'Arms straight, hips high'],
      [0.08, 'Bend your elbows back and lower your head between your hands'],
      [0.5, 'Press the floor away'],
      [0.88, 'Arms straight again'],
    ],
    intent: {
      planted: ['hands', 'feet'],
      hands: 'shoulder',
      feet: 'hip',
      elbows: 'back',
      moves: 25,
    },
  },
  'elevated-pike-pushup': {
    how: [
      [
        'Start',
        'Feet on a chair or sofa, hands on the floor shoulder-width apart. Walk your hands back until your hips are well above your shoulders.',
      ],
      [
        'Move',
        'Bend your elbows back and lower your head toward the floor between your hands, then press up steeply so your shoulders carry the load.',
      ],
      ['Finish', 'Arms straight, hips stacked high over your shoulders.'],
      [
        'Watch for',
        'The steeper the angle, the harder it is. Move your feet closer to your hands to make it easier.',
      ],
    ],
    phases: [
      [0, 'Arms straight, hips high'],
      [0.08, 'Lower your head between your hands'],
      [0.5, 'Press up steeply'],
      [0.88, 'Arms straight again'],
    ],
    intent: {
      planted: ['hands', 'feet'],
      hands: 'shoulder',
      feet: 'hip',
      elbows: 'back',
      moves: 25,
    },
  },
  'reverse-lunge': {
    how: [
      [
        'Start',
        'Stand tall with your feet together and your hands on your hips or in front of you.',
      ],
      [
        'Move',
        'Step one foot back and land on its toes. Lower straight down until your back knee almost touches the floor and your front thigh is about level. Push through the front heel and bring the back foot in to stand.',
      ],
      ['Finish', 'Stand tall, feet together, then switch legs.'],
      ['Watch for', 'Keep your front knee over your foot and your chest tall.'],
    ],
    phases: [
      [0, 'Stand tall'],
      [0.1, 'Step back onto your toes'],
      [0.3, 'Lower straight down'],
      [0.5, 'Drive through the front heel'],
      [0.78, 'Bring the foot in and stand'],
    ],
    intent: { planted: ['foot'], feet: 'hip' },
  },
  'split-squat': {
    how: [
      [
        'Start',
        'Take a long step forward and stay there: front foot flat, back foot on its toes, feet hip-width apart. Stand tall.',
      ],
      [
        'Move',
        'Lower straight down until your back knee almost touches the floor, then press back up. Your feet do not move.',
      ],
      ['Finish', 'Stand tall in the same split stance.'],
      ['Watch for', 'Front knee over the foot, torso upright.'],
    ],
    phases: [
      [0, 'Stand tall in the split stance'],
      [0.1, 'Lower straight down'],
      [0.5, 'Press back up through the front heel'],
    ],
    intent: { planted: ['feet'], feet: 'hip' },
  },
  'side-plank-hip-dip': {
    how: [
      [
        'Start',
        'Lie on your side, forearm on the floor under your shoulder, feet stacked. Lift your hips so your body is a straight line from head to heels.',
      ],
      [
        'Move',
        'Lower your hip toward the floor without resting, then lift it back above the straight line.',
      ],
      ['Finish', 'Back in the straight side plank.'],
      ['Watch for', 'Keep your shoulder pushed away from the floor and your hips facing forward.'],
    ],
    phases: [
      [0, 'Side plank: straight line'],
      [0.12, 'Lower your hip toward the floor'],
      [0.5, 'Lift your hip back up'],
    ],
    intent: { planted: ['forearms', 'foot'] },
  },
  'wall-plank': {
    how: [
      ['Start', 'Start in a push-up position with your feet against a wall.'],
      [
        'Move',
        'Walk your feet up the wall, one step at a time, while your hands stay put. Your body rises into a long, straight line. Hold, then walk back down.',
      ],
      ['Finish', 'Feet high on the wall, body straight, shoulders open and glutes tight.'],
      ['Watch for', 'Do not let your hips sag or your lower back arch.'],
    ],
    phases: [
      [0, 'Feet on the floor against the wall'],
      [0.1, 'Walk your feet up the wall'],
      [0.4, 'Hold the straight line'],
      [0.6, 'Walk back down'],
    ],
    intent: { planted: ['hands'], hands: 'shoulder' },
  },
  'handstand-walk': {
    how: [
      [
        'Start',
        'Hold a handstand against a wall or freestanding, shoulders open, body in a straight line.',
      ],
      [
        'Move',
        'Shift your weight onto one hand, lift the other and place it a short distance ahead, then repeat with the other hand. Keep the steps small.',
      ],
      ['Finish', 'Come back to a steady handstand before you come down.'],
      ['Watch for', 'Look between your hands and keep your body line tight.'],
    ],
    phases: [
      [0, 'Weight on the left hand'],
      [0.1, 'Lift the right hand'],
      [0.3, 'Place it ahead'],
      [0.5, 'Weight on the right hand'],
      [0.6, 'Lift the left hand'],
      [0.8, 'Place it ahead'],
    ],
    intent: { planted: ['hand'], lifts: true, hands: 'shoulder', moves: 30 },
  },
  'hip-circles': {
    how: [
      ['Start', 'Stand with your feet a little wider than your hips and your hands on your hips.'],
      [
        'Move',
        'Draw slow, big circles with your hips, as if you were tracing the inside of a hoop. After a few circles, change direction.',
      ],
      ['Finish', 'Come back to the middle and stand tall.'],
      ['Watch for', 'Keep your shoulders quiet and your feet flat.'],
    ],
    phases: [
      [0, 'Circle one way'],
      [0.5, 'Change direction'],
    ],
    intent: { planted: ['feet'], moves: 30 },
  },
  'wrist-flexor': {
    how: [
      ['Start', 'Stand tall and hold one arm straight out in front of you, palm facing away.'],
      [
        'Move',
        'With your other hand, gently pull the fingers of that hand back toward you until you feel a stretch along the underside of your forearm. Hold, then switch arms.',
      ],
      ['Finish', 'Release slowly.'],
      ['Watch for', 'Keep your elbow straight and pull only to a gentle stretch.'],
    ],
    phases: [
      [0, 'Arm straight, palm out'],
      [0.2, 'Gently pull the fingers back'],
      [0.6, 'Hold the stretch'],
    ],
    intent: { planted: ['feet'], meet: [['handR', 'handL']] },
  },
  'muscle-up': {
    how: [
      ['Start', 'Hang from the bar with a strong grip and your body slightly behind it.'],
      [
        'Move',
        'Pull explosively to your waist, bring your chest over the bar and let your elbows swing back, then press out until your arms are straight above the bar.',
      ],
      ['Finish', 'Support position: arms straight, chest over the bar.'],
      ['Watch for', 'Keep the bar close to you and lean forward as you transition.'],
    ],
    phases: [
      [0, 'Hang from the bar'],
      [0.15, 'Pull explosively to your waist'],
      [0.45, 'Chest over the bar'],
      [0.7, 'Press out to straight arms'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', moves: 40 },
  },
  'worlds-greatest': {
    how: [
      ['Start', 'Step into a deep lunge with both hands on the floor beside the front foot.'],
      [
        'Move',
        'Rotate your chest toward the front knee and reach the arm on that side up to the ceiling, following it with your eyes. Bring it back down, then switch sides.',
      ],
      ['Finish', 'Both hands down again, ready to switch.'],
      ['Watch for', 'Keep your back leg long and your front knee over your foot.'],
    ],
    phases: [
      [0, 'Deep lunge, hands down'],
      [0.3, 'Rotate your chest and reach up'],
      [0.7, 'Bring the arm back down'],
    ],
    intent: { planted: ['hand', 'feet'], hipFlex: 165, moves: 50 },
  },
  'triceps-stretch': {
    how: [
      [
        'Start',
        'Stand tall. Lift one arm overhead and bend the elbow so your hand drops behind your head.',
      ],
      [
        'Move',
        'Put the other hand on that elbow and ease it gently back and across until you feel a stretch along the back of your upper arm. Hold, then switch.',
      ],
      ['Finish', 'Release slowly.'],
      ['Watch for', 'Do not arch your lower back or pull hard.'],
    ],
    phases: [
      [0, 'Hand behind your head'],
      [0.3, 'Ease the elbow back with the other hand'],
      [0.7, 'Hold the stretch'],
    ],
    intent: { planted: ['feet'], meet: [['handAny', 'elbowAny']] },
  },
  'one-arm-pushup': {
    how: [
      [
        'Start',
        'Feet wide, one hand directly under your chest, the other arm out of the way along your side or behind your back. Body in a straight line.',
      ],
      ['Move', 'Lower slowly and keep your hips square to the floor, then press back up.'],
      ['Finish', 'Arm straight, body level.'],
      ['Watch for', 'Wider feet make it easier. Do not let your hips twist.'],
    ],
    phases: [
      [0, 'Arm straight, feet wide'],
      [0.1, 'Lower slowly'],
      [0.5, 'Press back up'],
    ],
    intent: { planted: ['hand', 'feet'], feet: 'wide', elbows: 'tucked', moves: 25 },
  },
  'knees-to-chest': {
    how: [
      [
        'Start',
        'Lie on your back and hug both knees in toward your chest, hands around your shins.',
      ],
      [
        'Move',
        'Hold the hug, then rock gently from side to side, letting your lower back roll against the floor.',
      ],
      ['Finish', 'Rest in the middle and breathe slowly.'],
      ['Watch for', 'Keep your head relaxed on the floor and your breathing slow.'],
    ],
    phases: [
      [0, 'Hug your knees in'],
      [0.25, 'Rock gently to one side'],
      [0.5, 'Back to the middle'],
      [0.75, 'Rock to the other side'],
    ],
    intent: {
      planted: ['seat'],
      lifts: true,
      faces: 'up',
      meet: [['handAny', 'kneeAny']],
      moves: 30,
    },
  },
  'wall-pushup': {
    how: [
      [
        'Start',
        'Stand about an arm and a half from a wall, feet together. Put your hands on the wall at shoulder height, a little wider than your shoulders, and lean in so your body is a straight line.',
      ],
      [
        'Move',
        'Bend your elbows to about 45° from your sides and bring your chest toward the wall, keeping your body straight. Push the wall away until your arms are straight.',
      ],
      ['Finish', 'Arms straight, leaning on the wall in one line from head to heels.'],
      [
        'Watch for',
        'Do not push your hips back. Step your feet farther from the wall to make it harder.',
      ],
    ],
    phases: [
      [0, 'Arms straight, body in one line'],
      [0.08, 'Bend your elbows and bring your chest to the wall'],
      [0.5, 'Push the wall away'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['wallhands', 'feet'], hands: 'shoulder', moves: 12 },
  },
  'incline-pushup': {
    how: [
      [
        'Start',
        'Put your hands on a sturdy table, bench or sofa edge, a little wider than your shoulders. Step your feet back until your body is a straight line from head to heels.',
      ],
      [
        'Move',
        'Bend your elbows to about 45° from your sides and lower your chest toward the edge. Press back up until your arms are straight.',
      ],
      ['Finish', 'Arms straight, body level in one line.'],
      ['Watch for', 'The lower the surface, the harder it is. Keep your hips from sagging.'],
    ],
    phases: [
      [0, 'Arms straight, body in one line'],
      [0.08, 'Lower your chest to the edge'],
      [0.5, 'Press back up'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['hands', 'feet'], hands: 'shoulder', moves: 15 },
  },
  'knee-pushup': {
    how: [
      [
        'Start',
        'Kneel and place your hands under your shoulders, a little wider. Walk your knees back so your body is a straight line from head to knees, ankles crossed in the air.',
      ],
      [
        'Move',
        'Bend your elbows to about 45° from your sides and lower your chest toward the floor. Press back up until your arms are straight.',
      ],
      ['Finish', 'Arms straight, body in one line from head to knees.'],
      ['Watch for', 'Keep your hips in line with your shoulders. Do not sit back onto your heels.'],
    ],
    phases: [
      [0, 'Arms straight, body in one line'],
      [0.08, 'Lower your chest toward the floor'],
      [0.5, 'Press back up'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['hands', 'knees'], hands: 'shoulder', moves: 15 },
  },
  pushup: {
    how: [
      [
        'Start',
        'Hands on the floor a little wider than your shoulders, toes on the floor, body in one straight line from head to heels. Arms straight.',
      ],
      [
        'Move',
        'Bend your elbows to about 45° from your sides and lower until your chest is about a fist from the floor. Press the floor away until your arms are straight.',
      ],
      ['Finish', 'Arms straight, body level.'],
      [
        'Watch for',
        'Keep your hips level, your glutes tight and your head in line with your spine.',
      ],
    ],
    phases: [
      [0, 'Arms straight, body in one line'],
      [0.08, 'Lower your chest to a fist from the floor'],
      [0.5, 'Press the floor away'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['hands', 'feet'], moves: 15 },
  },
  'diamond-pushup': {
    how: [
      [
        'Start',
        'Push-up position with your hands together under your chest, thumbs and index fingers touching to make a diamond. Body in one line.',
      ],
      [
        'Move',
        'Lower your chest toward your hands, with your elbows brushing past your ribs. Press back up until your arms are straight.',
      ],
      ['Finish', 'Arms straight, hands still together.'],
      [
        'Watch for',
        'Keep your elbows close to your sides. Drop to your knees if your wrists complain.',
      ],
    ],
    phases: [
      [0, 'Hands together, arms straight'],
      [0.08, 'Lower your chest to your hands, elbows close'],
      [0.5, 'Press back up'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['hands', 'feet'], hands: 'touching', elbows: 'tucked', moves: 15 },
  },
  'decline-pushup': {
    how: [
      [
        'Start',
        'Put your feet on a chair or sofa and your hands on the floor a little wider than your shoulders. Body in one straight line, tilted head down.',
      ],
      [
        'Move',
        'Bend your elbows to about 45° from your sides and lower your head and chest toward the floor. Press back up until your arms are straight.',
      ],
      ['Finish', 'Arms straight, body in one line.'],
      [
        'Watch for',
        'The higher your feet, the more your shoulders work. Do not let your hips sag.',
      ],
    ],
    phases: [
      [0, 'Arms straight, feet raised'],
      [0.08, 'Lower your chest toward the floor'],
      [0.5, 'Press back up'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['hands', 'feet'], moves: 15 },
  },
  'ring-pushup': {
    how: [
      [
        'Start',
        'Hold rings hung low, about a hand above the floor, with your arms straight and your body in one line.',
      ],
      [
        'Move',
        'Lower your chest between the rings, keeping them close to your ribs, then press up and turn your palms slightly forward at the top.',
      ],
      ['Finish', 'Arms straight, rings steady.'],
      [
        'Watch for',
        'Squeeze the rings toward your body so they stay still. Lower rings are harder.',
      ],
    ],
    phases: [
      [0, 'Arms straight, rings steady'],
      [0.08, 'Lower between the rings, elbows close'],
      [0.5, 'Press up and turn your palms forward'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['grip', 'feet'], elbows: 'tucked', moves: 15 },
  },
  'archer-pushup': {
    how: [
      [
        'Start',
        'Push-up position with your hands much wider than your shoulders, fingers pointing a little outward. Arms straight.',
      ],
      [
        'Move',
        'Bend one arm and lower your chest over that hand while the other arm stays long and straight out to the side. Press back up and lower to the other side.',
      ],
      ['Finish', 'Arms straight, hands wide.'],
      [
        'Watch for',
        'Keep the straight arm long and your hips level. Turn the straight-arm hand outward if your wrist is sore.',
      ],
    ],
    phases: [
      [0, 'Hands wide, arms straight'],
      [0.12, 'Lower over the left arm, right arm straight'],
      [0.5, 'Press back up'],
      [0.62, 'Lower over the right arm, left arm straight'],
      [0.9, 'Press back up'],
    ],
    intent: { planted: ['hands', 'feet'], feet: 'wide', moves: 25 },
  },
  'pseudo-planche-pushup': {
    how: [
      [
        'Start',
        'Push-up position with your hands near your lower ribs or waist, fingers pointing back or out. Lean forward so your shoulders sit ahead of your hands.',
      ],
      [
        'Move',
        'Keep the forward lean and lower your chest, with your elbows pointing back close to your sides. Press back up without losing the lean.',
      ],
      ['Finish', 'Arms straight, shoulders still ahead of your hands.'],
      [
        'Watch for',
        'This puts a lot of load on your wrists and shoulders. Go slowly and warm up first.',
      ],
    ],
    phases: [
      [0, 'Lean forward, arms straight'],
      [0.08, 'Lower with your elbows pointing back'],
      [0.5, 'Press up, keeping the lean'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['hands', 'feet'], hands: 'shoulder', elbows: 'tucked', moves: 15 },
  },
  'wall-hspu': {
    how: [
      [
        'Start',
        'Kick up into a handstand with your back to the wall, hands about shoulder-width apart, arms straight and body in a line.',
      ],
      [
        'Move',
        'Bend your elbows and lower your head toward the floor between your hands, with your elbows angled back and out. Press back up until your arms are straight.',
      ],
      ['Finish', 'Arms straight, body in a line against the wall.'],
      ['Watch for', 'Control the way down. A folded towel under your head makes the bottom safer.'],
    ],
    phases: [
      [0, 'Handstand, arms straight'],
      [0.08, 'Lower your head between your hands'],
      [0.5, 'Press up'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['hands'], hands: 'shoulder', elbows: 'back', moves: 25 },
  },
  'bench-dip': {
    how: [
      [
        'Start',
        'Sit on the edge of a sturdy bench or chair with your hands on the edge beside your hips, fingers pointing forward. Slide your hips off the edge and put your feet out in front, knees bent or straight.',
      ],
      [
        'Move',
        'Bend your elbows back to about 90° and lower your hips toward the floor, keeping your back close to the bench. Press through your palms until your arms are straight.',
      ],
      ['Finish', 'Arms straight, chest lifted, shoulders down.'],
      [
        'Watch for',
        'Do not shrug or let your shoulders roll forward, and stop at 90°. Straighter legs make it harder.',
      ],
    ],
    phases: [
      [0, 'Arms straight, hips off the bench'],
      [0.1, 'Bend your elbows back and lower your hips'],
      [0.5, 'Press through your palms'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['hands', 'feet'], hands: 'shoulder', elbows: 'back', moves: 18 },
  },
  'parallel-dip': {
    how: [
      [
        'Start',
        'Grip two parallel bars at about hip height with your arms straight and your shoulders pressed down, away from your ears. Bend your knees and cross your ankles behind you.',
      ],
      [
        'Move',
        'Lean slightly forward and bend your elbows back until your upper arms are about level with the floor. Press the bars away until your arms are straight.',
      ],
      ['Finish', 'Arms straight, shoulders down, chest proud.'],
      ['Watch for', 'Keep your shoulders down and go only as deep as you can control.'],
    ],
    phases: [
      [0, 'Arms straight, shoulders down'],
      [0.1, 'Lean forward and lower until your upper arms are level'],
      [0.5, 'Press the bars away'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', elbows: 'back', moves: 20 },
  },
  'ring-dip': {
    how: [
      [
        'Start',
        'Hold the rings with your arms straight and locked out, the rings close to your body and turned slightly outward, shoulders pressed down.',
      ],
      [
        'Move',
        'Bend your elbows back and lower until your upper arms are about level with the floor, keeping the rings close to your ribs. Press up and turn the rings out again at the top.',
      ],
      ['Finish', 'Arms locked, rings turned out.'],
      [
        'Watch for',
        'Rings wobble, so squeeze them toward your body and go slowly. Do not let them drift apart.',
      ],
    ],
    phases: [
      [0, 'Arms locked, rings turned out'],
      [0.1, 'Lower with the rings close to your ribs'],
      [0.5, 'Press up and turn the rings out'],
      [0.9, 'Locked out again'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', elbows: 'back', moves: 20 },
  },
  squat: {
    how: [
      [
        'Start',
        'Stand with your feet about shoulder-width apart, toes turned out a little, and your arms out in front of you.',
      ],
      [
        'Move',
        'Sit your hips back and down as if onto a chair, keeping your heels flat and your knees tracking over your toes. Go down until your thighs are about level, then drive through your whole foot to stand.',
      ],
      ['Finish', 'Stand tall, hips and knees straight.'],
      ['Watch for', 'Keep your chest up and your knees pointing the same way as your toes.'],
    ],
    phases: [
      [0, 'Stand tall'],
      [0.08, 'Sit your hips back and down'],
      [0.5, 'Drive up through your whole foot'],
      [0.9, 'Stand tall'],
    ],
    intent: { planted: ['feet'], feet: 'wide', moves: 40 },
  },
  'bulgarian-split-squat': {
    how: [
      [
        'Start',
        'Stand a long step in front of a chair or sofa, facing away from it. Rest the top of one foot on the seat behind you, your front foot flat and your chest tall.',
      ],
      [
        'Move',
        'Lower straight down until your front thigh is about level and your back knee almost touches the floor. Press through the front heel to stand.',
      ],
      ['Finish', 'Stand tall, back foot still on the seat.'],
      [
        'Watch for',
        'Most of your weight is on the front leg. Keep your front knee over your foot.',
      ],
    ],
    phases: [
      [0, 'Stand tall, back foot on the seat'],
      [0.08, 'Lower straight down'],
      [0.5, 'Press through the front heel'],
      [0.9, 'Stand tall'],
    ],
    intent: { planted: ['feet'], feet: 'hip', hipExt: 55, moves: 25 },
  },
  'shrimp-squat': {
    how: [
      [
        'Start',
        'Stand on one leg. Bend the other knee and reach back with the hand on that side to hold your foot behind you.',
      ],
      [
        'Move',
        'Lower your body straight down until your back knee almost touches the floor, keeping hold of your foot, then drive up through the standing heel.',
      ],
      ['Finish', 'Stand tall on one leg, still holding your foot.'],
      [
        'Watch for',
        'Lean forward a little to keep your balance and keep the standing knee over your foot.',
      ],
    ],
    phases: [
      [0, 'Stand on one leg, holding your back foot'],
      [0.08, 'Lower until your back knee nearly touches'],
      [0.5, 'Drive up through the standing heel'],
      [0.9, 'Stand tall'],
    ],
    intent: { planted: ['foot'], meet: [['handAny', 'ankleAny']], hipFlex: 168, moves: 40 },
  },
  'assisted-pistol': {
    how: [
      [
        'Start',
        'Stand beside a doorframe or sturdy post with one hand lightly on it and one foot lifted in front of you.',
      ],
      [
        'Move',
        'Sit down and back on the standing leg while the free leg stays straight out in front and off the floor. Use your hand only for light balance, then drive up through your heel.',
      ],
      ['Finish', 'Stand tall on one leg.'],
      ['Watch for', 'Use the hand as little as you can and keep your heel flat.'],
    ],
    phases: [
      [0, 'Stand on one leg, hand on the frame'],
      [0.08, 'Sit down and back, free leg out front'],
      [0.5, 'Drive up through your heel'],
      [0.9, 'Stand tall'],
    ],
    intent: { planted: ['foot', 'holdBox'], hipFlex: 168, moves: 40 },
  },
  'pistol-squat': {
    how: [
      [
        'Start',
        'Stand on one leg with the other leg lifted straight in front of you and your arms out in front for balance.',
      ],
      [
        'Move',
        'Sit back and down on the standing leg, keeping the free leg off the floor, then drive up through your heel.',
      ],
      ['Finish', 'Stand tall on one leg.'],
      [
        'Watch for',
        'Keep your heel flat and your free leg lifted. Go only as deep as you can control.',
      ],
    ],
    phases: [
      [0, 'Stand on one leg, free leg in front'],
      [0.08, 'Sit back and down'],
      [0.5, 'Drive up through your heel'],
      [0.9, 'Stand tall'],
    ],
    intent: { planted: ['foot'], hipFlex: 168, moves: 45 },
  },
  'jump-squat': {
    how: [
      ['Start', 'Stand with your feet about shoulder-width apart.'],
      [
        'Move',
        'Drop into a squat with your arms swung back, then explode up, swinging your arms overhead and rising onto your toes. Land softly on your whole foot and sink straight into the next squat.',
      ],
      ['Finish', 'Land in a squat, ready for the next jump.'],
      ['Watch for', 'Land quietly with soft knees pointing the same way as your toes.'],
    ],
    phases: [
      [0, 'Crouch with your arms back'],
      [0.25, 'Explode up, arms swing overhead'],
      [0.47, 'Toes pointed in the air'],
      [0.7, 'Land softly and sink into the next squat'],
    ],
    intent: { moves: 60 },
  },
  'broad-jump': {
    how: [
      ['Start', 'Stand with your feet about hip-width apart.'],
      [
        'Move',
        'Swing your arms back and bend your knees, then swing your arms forward as you jump out as far as you can. Land softly on both feet, absorbing with your hips and knees.',
      ],
      ['Finish', 'Land in a balanced crouch, then stand.'],
      ['Watch for', 'Stick the landing before you stand up.'],
    ],
    phases: [
      [0, 'Swing your arms back and crouch'],
      [0.25, 'Push off, arms swing forward'],
      [0.4, 'Fly out, legs trailing'],
      [0.58, 'Reach your feet forward to land'],
      [0.75, 'Land softly and absorb'],
    ],
    intent: { moves: 60 },
  },
  'tuck-jump': {
    how: [
      ['Start', 'Stand with your feet about shoulder-width apart.'],
      [
        'Move',
        'Crouch with your arms back, then jump straight up and pull your knees toward your chest at the top. Land softly with bent knees.',
      ],
      ['Finish', 'Land in a crouch, ready for the next jump.'],
      ['Watch for', 'Land softly, and rest between jumps if your form gets sloppy.'],
    ],
    phases: [
      [0, 'Crouch, arms back'],
      [0.25, 'Jump up'],
      [0.45, 'Pull your knees to your chest'],
      [0.7, 'Land softly'],
    ],
    intent: { moves: 60 },
  },
  'box-jump': {
    how: [
      [
        'Start',
        "Stand an arm's length from a sturdy box or step, feet about shoulder-width apart.",
      ],
      [
        'Move',
        'Swing your arms back and crouch, then jump up and land softly on the box with both feet, hips and knees bent. Stand tall on the box, then step down. Do not jump down.',
      ],
      ['Finish', 'Stand tall on the box, then step down.'],
      ['Watch for', 'Use a stable surface and look at where you will land.'],
    ],
    phases: [
      [0, 'Crouch, arms back'],
      [0.14, 'Jump up'],
      [0.26, 'Tuck your knees over the box'],
      [0.38, 'Land softly on the box'],
      [0.5, 'Stand tall on the box'],
      [0.62, 'Step down carefully'],
    ],
    intent: { moves: 60 },
  },
  'glute-bridge': {
    how: [
      [
        'Start',
        'Lie on your back with your knees bent, your feet flat on the floor about hip-width apart, and your arms by your sides.',
      ],
      [
        'Move',
        'Squeeze your glutes and push through your heels to lift your hips until your body is a straight line from your shoulders to your knees. Pause, then lower slowly.',
      ],
      ['Finish', 'Hips high, glutes squeezed.'],
      ['Watch for', 'Do not arch your lower back. Squeeze your glutes at the top.'],
    ],
    phases: [
      [0, 'Feet flat, knees bent'],
      [0.08, 'Squeeze and lift your hips'],
      [0.5, 'Lower slowly'],
      [0.9, 'Back to the floor'],
    ],
    intent: { planted: ['feet'], faces: 'up', hipExt: 40, moves: 12 },
  },
  'single-leg-bridge': {
    how: [
      [
        'Start',
        'Lie on your back with one foot flat on the floor and the other leg held straight out in front of you.',
      ],
      [
        'Move',
        'Squeeze the glute of your working leg and push through that heel to lift your hips until your body is a straight line. Keep your hips level, pause, then lower slowly.',
      ],
      ['Finish', 'Hips high and level.'],
      ['Watch for', 'Do not let your hips twist or drop on the side of the free leg.'],
    ],
    phases: [
      [0, 'One foot flat, one leg straight'],
      [0.08, 'Squeeze and lift your hips'],
      [0.5, 'Lower slowly'],
      [0.9, 'Back to the floor'],
    ],
    intent: { planted: ['foot'], faces: 'up', moves: 12 },
  },
  'hip-thrust': {
    how: [
      [
        'Start',
        'Sit on the floor with your upper back against the edge of a sofa or bench, knees bent and feet flat on the floor.',
      ],
      [
        'Move',
        'Drive through your heels to lift your hips until your thighs are level and your body is a straight line from your shoulders to your knees. Pause and squeeze, then lower.',
      ],
      ['Finish', 'Hips high, chin slightly tucked.'],
      ['Watch for', 'Keep your ribs down and do not push your lower back into an arch.'],
    ],
    phases: [
      [0, 'Upper back on the bench, hips low'],
      [0.08, 'Drive your hips up'],
      [0.5, 'Pause, squeeze, then lower'],
      [0.9, 'Hips low again'],
    ],
    intent: { planted: ['feet'], faces: 'up', moves: 18 },
  },
  'single-leg-rdl': {
    how: [
      ['Start', 'Stand on one leg with your standing knee soft and your arms hanging.'],
      [
        'Move',
        'Hinge at the hip, pushing your hips back as your free leg reaches straight behind you, until your body is about level and your back is flat. Squeeze your glutes to stand.',
      ],
      ['Finish', 'Stand tall on one leg.'],
      ['Watch for', 'Keep your hips square to the floor and your back flat.'],
    ],
    phases: [
      [0, 'Stand on one leg, soft knee'],
      [0.08, 'Hinge forward, free leg reaching back'],
      [0.5, 'Squeeze your glutes and stand'],
      [0.9, 'Stand tall'],
    ],
    intent: { planted: ['foot'], moves: 50 },
  },
  'single-leg-hip-thrust': {
    how: [
      [
        'Start',
        'Sit with your upper back against a bench, one foot flat on the floor and the other leg held straight out in front of you.',
      ],
      [
        'Move',
        'Drive through the heel of your working leg to lift your hips until your body is a straight line from your shoulders to your knee. Keep your hips level, pause, then lower.',
      ],
      ['Finish', 'Hips high and level.'],
      ['Watch for', 'Do not let your hips twist on the side of the free leg.'],
    ],
    phases: [
      [0, 'One foot flat, upper back on the bench'],
      [0.08, 'Drive your hips up'],
      [0.5, 'Pause, then lower'],
      [0.9, 'Hips low again'],
    ],
    intent: { planted: ['foot'], faces: 'up', moves: 18 },
  },
  'nordic-curl': {
    how: [
      [
        'Start',
        'Kneel on a soft surface with your heels hooked under a sofa, or held by a partner. Your body is straight from your knees to your head and your hands are ready in front of your chest.',
      ],
      [
        'Move',
        'Lower yourself forward as slowly as you can, keeping your hips extended and your body in a straight line. Catch yourself with your hands near the floor and push back up.',
      ],
      ['Finish', 'Back to kneeling tall.'],
      ['Watch for', 'Go only as far as you can control. Your hamstrings do all the braking.'],
    ],
    phases: [
      [0, 'Kneeling tall, body in one line'],
      [0.08, 'Lower as slowly as you can'],
      [0.5, 'Catch with your hands and push back up'],
    ],
    intent: { planted: ['knees'], moves: 40 },
  },
  'calf-raise': {
    how: [
      [
        'Start',
        'Stand tall with your feet about hip-width apart, ideally with your toes on the edge of a step.',
      ],
      [
        'Move',
        'Rise as high as you can onto your toes, pause at the top, then lower slowly all the way down.',
      ],
      ['Finish', 'Heels down, ankles relaxed.'],
      ['Watch for', 'Go all the way up and all the way down, and do not roll your ankles outward.'],
    ],
    phases: [
      [0, 'Heels down'],
      [0.08, 'Rise onto your toes'],
      [0.5, 'Pause, then lower slowly'],
    ],
    intent: { planted: ['feet'] },
  },
  'single-leg-calf-raise': {
    how: [
      [
        'Start',
        'Stand on one foot with a light hand on a wall for balance, the other foot lifted behind you.',
      ],
      [
        'Move',
        'Rise as high as you can onto the toes of your standing foot, pause at the top, then lower slowly all the way down.',
      ],
      ['Finish', 'Heel down, ankle relaxed.'],
      ['Watch for', 'Use the wall only for balance, not to pull yourself up.'],
    ],
    phases: [
      [0, 'Heel down, hand on the wall'],
      [0.08, 'Rise onto your toes'],
      [0.5, 'Pause, then lower slowly'],
    ],
    intent: { planted: ['foot', 'wallhand'] },
  },
  'single-leg-stand': {
    how: [
      [
        'Start',
        'Stand tall with your arms out a little for balance and your eyes on a point ahead.',
      ],
      [
        'Move',
        'Lift one foot off the floor and hold, keeping your standing knee soft and your hips level. When it gets easy, try closing your eyes. Then switch legs.',
      ],
      ['Finish', 'Lower the foot gently.'],
      ['Watch for', 'Do not lock your standing knee or lean to one side.'],
    ],
    phases: [
      [0, 'Lift one foot and balance'],
      [0.5, 'Stay tall and steady'],
    ],
    intent: { planted: ['foot'] },
  },
  airplane: {
    how: [
      ['Start', 'Stand on one leg with your arms out to the sides like wings.'],
      [
        'Move',
        'Hinge forward from the hip as your free leg lifts straight behind you, until your body is about level, with your arms out and your hips level. Return to standing.',
      ],
      ['Finish', 'Stand tall on one leg.'],
      ['Watch for', 'Keep your hips square to the floor and your standing knee soft.'],
    ],
    phases: [
      [0, 'Stand on one leg, arms out'],
      [0.4, 'Hinge forward, free leg straight behind'],
      [0.8, 'Hold steady'],
    ],
    intent: { planted: ['foot'] },
  },
  'table-row': {
    how: [
      [
        'Start',
        'Lie on your back under a sturdy table and grip the edge with your hands about shoulder-width apart. Keep your body straight from your head to your heels, with your heels on the floor and your arms straight.',
      ],
      [
        'Move',
        'Pull your chest up to the edge of the table by driving your elbows back and squeezing your shoulder blades together, keeping your body in one line. Lower slowly until your arms are straight.',
      ],
      ['Finish', 'Arms straight, body level.'],
      [
        'Watch for',
        'Check the table is stable and do not let your hips sag. Walk your feet further out to make it harder.',
      ],
    ],
    phases: [
      [0, 'Arms straight, body in one line'],
      [0.08, 'Pull your chest up to the table edge'],
      [0.5, 'Lower slowly'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['holdBox', 'feet'], hands: 'shoulder', moves: 20 },
  },
  'table-row-elevated': {
    how: [
      [
        'Start',
        'Lie under a sturdy table, gripping the edge, with your heels up on a chair so your body is level. Arms straight.',
      ],
      [
        'Move',
        'Pull your chest to the edge of the table, squeezing your shoulder blades together, then lower slowly until your arms are straight.',
      ],
      ['Finish', 'Arms straight, body level.'],
      ['Watch for', 'Keep your body in one line. The higher your feet, the harder it is.'],
    ],
    phases: [
      [0, 'Arms straight, feet up'],
      [0.08, 'Pull your chest to the table edge'],
      [0.5, 'Lower slowly'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['holdBox', 'feet'], hands: 'shoulder', moves: 20 },
  },
  'aussie-row': {
    how: [
      [
        'Start',
        'Set a bar at about waist height and hang under it with your hands slightly wider than your shoulders, heels on the floor and your body straight.',
      ],
      [
        'Move',
        'Pull your chest to the bar, driving your elbows down and back and squeezing your shoulder blades, then lower slowly until your arms are straight.',
      ],
      ['Finish', 'Arms straight, body in one line.'],
      ['Watch for', 'Do not let your hips sag. A lower bar makes it harder.'],
    ],
    phases: [
      [0, 'Arms straight, body in one line'],
      [0.08, 'Pull your chest to the bar'],
      [0.5, 'Lower slowly'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['grip', 'feet'], hands: 'shoulder', moves: 20 },
  },
  'ring-row': {
    how: [
      [
        'Start',
        'Hold two rings hung at about waist height, heels on the floor, and lean back until your arms are straight and your body is in one line.',
      ],
      [
        'Move',
        'Pull your chest up between the rings, rotating your palms inward as you pull to your ribs, then lower slowly.',
      ],
      ['Finish', 'Arms straight, rings steady.'],
      [
        'Watch for',
        'Keep the rings still and your body straight. Lower the rings or walk your feet forward to make it harder.',
      ],
    ],
    phases: [
      [0, 'Arms straight, body in one line'],
      [0.08, 'Pull to your ribs, palms turning in'],
      [0.5, 'Lower slowly'],
      [0.9, 'Arms straight again'],
    ],
    intent: { planted: ['grip', 'feet'], hands: 'shoulder', moves: 20 },
  },
  'dead-hang': {
    how: [
      [
        'Start',
        'Grip a bar with your hands about shoulder-width apart and hang with your arms straight.',
      ],
      [
        'Move',
        'Hang still with active shoulders, pulled gently down and away from your ears, and breathe steadily.',
      ],
      ['Finish', 'Step down under control.'],
      ['Watch for', 'Do not swing, and come down before your grip fails.'],
    ],
    phases: [
      [0, 'Hang with active shoulders'],
      [0.5, 'Breathe and stay still'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder' },
  },
  'scap-pull': {
    how: [
      [
        'Start',
        'Hang from a bar with your arms straight and your hands about shoulder-width apart.',
      ],
      [
        'Move',
        'Without bending your elbows, pull your shoulder blades down and back so your body rises a few centimetres. Relax back down to a full hang.',
      ],
      ['Finish', 'Full hang, arms straight.'],
      [
        'Watch for',
        'Keep your elbows locked. The movement is small and comes from your shoulder blades.',
      ],
    ],
    phases: [
      [0, 'Full hang, arms straight'],
      [0.1, 'Pull your shoulder blades down and back'],
      [0.5, 'Relax back down'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', moves: 6 },
  },
  'negative-pullup': {
    how: [
      [
        'Start',
        'Jump or step up so your chin is over the bar, with your hands about shoulder-width apart.',
      ],
      [
        'Move',
        'Lower yourself as slowly as you can, taking 4 to 5 seconds, until your arms are straight. Then jump or step back up and repeat.',
      ],
      ['Finish', 'Arms straight at the bottom.'],
      ['Watch for', 'Control the whole way down and do not drop at the end.'],
    ],
    phases: [
      [0, 'Chin over the bar'],
      [0.06, 'Lower for 4 to 5 seconds'],
      [0.84, 'Arms straight: step back up'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', moves: 35 },
  },
  'band-pullup': {
    how: [
      [
        'Start',
        'Loop a resistance band over the bar and put one knee or foot in it. Hang with your arms straight and your hands about shoulder-width apart.',
      ],
      [
        'Move',
        'Pull your elbows down toward your hips until your chin clears the bar, then lower with control. The band helps most at the bottom.',
      ],
      ['Finish', 'Arms straight, band loose.'],
      ['Watch for', 'Use the lightest band that lets you finish clean reps.'],
    ],
    phases: [
      [0, 'Hang with straight arms, knee in the band'],
      [0.1, 'Pull your elbows toward your hips'],
      [0.5, 'Chin over the bar, then lower'],
      [0.7, 'Lower all the way down'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', moves: 35 },
  },
  chinup: {
    how: [
      [
        'Start',
        'Grip a bar with your palms toward you and your hands about shoulder-width apart or a little narrower. Hang with your arms straight.',
      ],
      [
        'Move',
        'Pull your chest toward the bar, keeping your elbows close to your sides, until your chin is over the bar. Lower all the way down.',
      ],
      ['Finish', 'Arms straight at the bottom.'],
      ['Watch for', 'Do not swing, and do not stop short at the bottom.'],
    ],
    phases: [
      [0, 'Hang with straight arms'],
      [0.1, 'Pull your chest to the bar, elbows close'],
      [0.5, 'Chin over the bar, then lower'],
      [0.7, 'Lower all the way down'],
    ],
    intent: { planted: ['grip'], hands: 'narrow', moves: 35 },
  },
  pullup: {
    how: [
      [
        'Start',
        'Grip a bar with your palms facing away and your hands a little wider than your shoulders. Hang with your arms straight and your shoulders pulled down.',
      ],
      [
        'Move',
        'Pull your elbows toward your hips until your chin clears the bar, then lower all the way down.',
      ],
      ['Finish', 'Arms straight at the bottom.'],
      ['Watch for', 'Do not swing, and keep your body tight.'],
    ],
    phases: [
      [0, 'Hang with straight arms'],
      [0.1, 'Pull your elbows toward your hips'],
      [0.5, 'Chin over the bar, then lower'],
      [0.7, 'Lower all the way down'],
    ],
    intent: { planted: ['grip'], hands: 'wide', moves: 35 },
  },
  'ring-pullup': {
    how: [
      [
        'Start',
        'Hold two rings with your arms straight and your body tight, the rings about shoulder-width apart.',
      ],
      [
        'Move',
        'Pull your elbows down toward your hips and bring your chest between the rings, turning the rings out slightly at the top. Lower slowly.',
      ],
      ['Finish', 'Arms straight, rings steady.'],
      ['Watch for', 'Keep the rings from swinging and your body tight.'],
    ],
    phases: [
      [0, 'Hang from the rings'],
      [0.1, 'Pull your chest between the rings'],
      [0.5, 'Turn the rings out at the top, then lower'],
      [0.7, 'Lower all the way down'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', moves: 35 },
  },
  'archer-pullup': {
    how: [
      [
        'Start',
        'Hang from a wide grip, hands well beyond shoulder-width, with your arms straight.',
      ],
      [
        'Move',
        'Pull your chest toward one hand while the other arm stays straight along the bar. Lower with control, then pull toward the other side.',
      ],
      ['Finish', 'Arms straight, hands wide.'],
      ['Watch for', 'Keep the straight arm long and do not twist your hips.'],
    ],
    phases: [
      [0, 'Hang from a wide grip'],
      [0.2, 'Pull toward the left hand, right arm straight'],
      [0.5, 'Lower'],
      [0.7, 'Pull toward the right hand, left arm straight'],
    ],
    intent: { planted: ['grip'], hands: 'wider', moves: 30 },
  },
  'typewriter-pullup': {
    how: [
      ['Start', 'Hang from a wide grip with your arms straight.'],
      [
        'Move',
        'Pull up until your chin is at your left hand. Stay up and slide your chest across to your right hand, then back to the left. Lower with control.',
      ],
      ['Finish', 'Arms straight, hands wide.'],
      ['Watch for', 'Stay high the whole time you slide, and keep both hands on the bar.'],
    ],
    phases: [
      [0, 'Hang from a wide grip'],
      [0.2, 'Pull up to your left hand'],
      [0.5, 'Slide across to the right hand'],
      [0.75, 'Slide back, then lower'],
    ],
    intent: { planted: ['grip'], hands: 'wider', moves: 30 },
  },
  'superman-hold': {
    how: [
      [
        'Start',
        'Lie face down on the floor with your arms stretched out in front of you and your legs straight.',
      ],
      [
        'Move',
        'Lift your arms, chest and legs a few centimetres off the floor at the same time. Look at the floor and keep your neck long. Hold, then lower.',
      ],
      ['Finish', 'Lower with control.'],
      ['Watch for', 'Lift from your back and glutes, not by cranking your neck up.'],
    ],
    phases: [
      [0, 'Arms, chest and legs lifted'],
      [0.5, 'Hold and breathe'],
    ],
    intent: { planted: ['seat'], faces: 'down' },
  },
  'reverse-snow-angel': {
    how: [
      [
        'Start',
        'Lie face down with your arms by your sides, palms toward your hips, and your forehead just off the floor.',
      ],
      [
        'Move',
        'Sweep your arms slowly out and up in a wide arc, thumbs pointing up, until they are overhead. Keep them lifted off the floor and sweep back down to your hips.',
      ],
      ['Finish', 'Arms back by your hips.'],
      ['Watch for', 'Keep your neck long and your arms light, off the floor the whole time.'],
    ],
    phases: [
      [0, 'Arms by your hips'],
      [0.1, 'Sweep out and up, thumbs up'],
      [0.5, 'Sweep back down to your hips'],
    ],
    intent: { planted: ['seat'], moves: 30 },
  },
  'prone-ytw': {
    how: [
      [
        'Start',
        'Lie face down with your arms stretched overhead and your forehead just off the floor.',
      ],
      [
        'Move',
        'Lift your arms off the floor and hold a Y, sweep out to a T with your arms straight, then bend into a W with your elbows down. Squeeze your shoulder blades at each shape.',
      ],
      ['Finish', 'Lower your arms with control.'],
      ['Watch for', 'Do not shrug your shoulders and keep your neck long.'],
    ],
    phases: [
      [0, 'Y: arms overhead in a V'],
      [0.2, 'Sweep out to a T'],
      [0.33, 'T: arms straight out'],
      [0.54, 'Bend into a W'],
      [0.67, 'W: elbows down, squeeze your shoulder blades'],
      [0.87, 'Back to the Y'],
    ],
    intent: { planted: ['seat'], moves: 30 },
  },
  'band-pullapart': {
    how: [
      [
        'Start',
        'Stand tall holding a resistance band in front of your chest with straight arms and your hands about shoulder-width apart.',
      ],
      [
        'Move',
        'Pull the band apart by sweeping your arms out to the sides until the band touches your chest, squeezing your shoulder blades together. Return slowly.',
      ],
      ['Finish', 'Arms straight in front, band taut.'],
      ['Watch for', 'Keep your arms straight and your ribs down, and do not shrug.'],
    ],
    phases: [
      [0, 'Arms straight in front'],
      [0.1, 'Pull the band apart'],
      [0.5, 'Return slowly'],
    ],
    intent: { planted: ['feet'], moves: 35 },
  },
  'dead-bug': {
    how: [
      [
        'Start',
        'Lie on your back with your arms straight up toward the ceiling and your knees bent over your hips, shins level with the floor. Press your lower back into the floor.',
      ],
      [
        'Move',
        'Slowly lower one arm overhead and straighten the opposite leg toward the floor, keeping your lower back pressed down. Bring them back and switch to the other arm and leg.',
      ],
      ['Finish', 'Arms up, knees over hips.'],
      [
        'Watch for',
        'Keep your lower back on the floor the whole time. Move only as far as you can without it arching.',
      ],
    ],
    phases: [
      [0, 'Arms up, knees over hips'],
      [0.25, 'Lower the opposite arm and leg'],
      [0.5, 'Back to the start'],
      [0.75, 'Switch to the other arm and leg'],
    ],
    intent: { planted: ['seat'], faces: 'up', moves: 40 },
  },
  plank: {
    how: [
      [
        'Start',
        'Lie face down, then prop yourself on your forearms with your elbows directly under your shoulders and your toes on the floor.',
      ],
      [
        'Move',
        'Lift your hips so your body is one straight line from your head to your heels. Squeeze your glutes, brace your abs and hold, breathing steadily.',
      ],
      ['Finish', 'Lower your knees to rest.'],
      [
        'Watch for',
        'Do not let your hips sag or pike up, and keep your neck in line with your spine.',
      ],
    ],
    phases: [
      [0, 'Straight line, forearms down'],
      [0.5, 'Hold, breathe, glutes tight'],
    ],
    intent: { planted: ['forearms', 'feet'] },
  },
  'hollow-hold': {
    how: [
      ['Start', 'Lie on your back with your arms stretched overhead and your legs straight.'],
      [
        'Move',
        'Press your lower back into the floor and lift your shoulders and legs a few inches off it, so your body is a long, shallow banana shape. Hold it tight.',
      ],
      ['Finish', 'Lower with control.'],
      ['Watch for', 'If your lower back lifts, raise your legs higher or bend your knees.'],
    ],
    phases: [
      [0, 'Lower back down, arms and legs long'],
      [0.5, 'Hold the shape'],
    ],
    intent: { planted: ['seat'], lifts: true, faces: 'up' },
  },
  'hollow-rock': {
    how: [
      [
        'Start',
        'Get into the hollow body shape: lower back pressed down, arms overhead, legs straight and low.',
      ],
      [
        'Move',
        'Keep the shape and rock back and forth like a boat, with your whole body moving as one piece.',
      ],
      ['Finish', 'Settle back into the hold.'],
      [
        'Watch for',
        'Do not let the shape break. If your lower back arches, make the rocks smaller.',
      ],
    ],
    phases: [
      [0, 'Rock back, shape tight'],
      [0.5, 'Rock forward'],
    ],
    intent: { planted: ['seat'], lifts: true, faces: 'up', moves: 20 },
  },
  'dragon-flag-negative': {
    how: [
      [
        'Start',
        'Lie on your back on a bench and hold the edge behind your head. Lift your whole body up into a straight, vertical line over your shoulders.',
      ],
      [
        'Move',
        'Keeping your body straight from your shoulders to your toes, lower slowly toward the bench without bending at the hips, then reset.',
      ],
      ['Finish', 'Body straight, lowered as far as you can control.'],
      ['Watch for', 'Only your upper back touches the bench. Do not bend at the hips.'],
    ],
    phases: [
      [0, 'Body straight and vertical'],
      [0.08, 'Lower as slowly as you can, body straight'],
      [0.5, 'Reset to the top'],
    ],
    intent: { planted: ['holdBox'], moves: 60 },
  },
  'reverse-crunch': {
    how: [
      [
        'Start',
        'Lie on your back with your arms by your sides, palms down, and your knees bent over your hips.',
      ],
      [
        'Move',
        'Curl your hips off the floor, bringing your knees toward your chest using your abs, not momentum. Lower slowly.',
      ],
      ['Finish', 'Hips down, knees over hips.'],
      ['Watch for', 'Do not swing your legs. Lift from your lower abs.'],
    ],
    phases: [
      [0, 'Knees over hips, hips down'],
      [0.1, 'Curl your hips off the floor'],
      [0.5, 'Lower slowly'],
    ],
    intent: { planted: ['seat'], lifts: true, faces: 'up', moves: 20 },
  },
  'lying-leg-raise': {
    how: [
      [
        'Start',
        'Lie on your back with your arms by your sides, palms down, and your legs straight and just off the floor.',
      ],
      [
        'Move',
        'Raise your straight legs to vertical, then lower them slowly without letting your lower back arch off the floor.',
      ],
      ['Finish', 'Legs low, back flat.'],
      ['Watch for', 'Bend your knees a little if your lower back lifts.'],
    ],
    phases: [
      [0, 'Legs straight, low back down'],
      [0.1, 'Raise your legs to vertical'],
      [0.5, 'Lower slowly'],
    ],
    intent: { planted: ['seat'], faces: 'up', moves: 60 },
  },
  'hanging-knee-raise': {
    how: [
      ['Start', 'Hang from a bar with your arms straight and your shoulders pulled down.'],
      ['Move', 'Curl your knees up toward your chest without swinging, then lower under control.'],
      ['Finish', 'Hang with straight legs.'],
      ['Watch for', 'Use your abs, not your swing.'],
    ],
    phases: [
      [0, 'Hang with straight arms'],
      [0.1, 'Raise your knees to your chest'],
      [0.5, 'Lower under control'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', moves: 35 },
  },
  'hanging-leg-raise': {
    how: [
      ['Start', 'Hang from a bar with your arms straight and your shoulders pulled down.'],
      [
        'Move',
        'Raise your straight legs until they are level with the floor or higher, without swinging, then lower under control.',
      ],
      ['Finish', 'Hang with straight legs.'],
      ['Watch for', 'Keep your legs straight and do not swing.'],
    ],
    phases: [
      [0, 'Hang with straight arms'],
      [0.1, 'Raise straight legs to level'],
      [0.5, 'Lower under control'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', moves: 50 },
  },
  'toes-to-bar': {
    how: [
      ['Start', 'Hang from a bar with your arms straight and your shoulders pulled down.'],
      [
        'Move',
        'Lean back slightly, pike your hips and lift your straight legs until your toes touch the bar. Lower with control.',
      ],
      ['Finish', 'Hang with straight legs.'],
      ['Watch for', 'Do not kip wildly. Control the lowering.'],
    ],
    phases: [
      [0, 'Hang with straight arms'],
      [0.1, 'Pike your hips and lift your toes to the bar'],
      [0.5, 'Lower with control'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', moves: 50 },
  },
  'windshield-wiper': {
    how: [
      [
        'Start',
        'Hang from a bar with your arms straight and lift your legs together in front of you.',
      ],
      [
        'Move',
        'Rotate your legs from side to side like a windshield wiper, turning at your hips, while your upper body stays still.',
      ],
      ['Finish', 'Legs back to the middle, lower with control.'],
      ['Watch for', 'Keep your shoulders still and your legs together.'],
    ],
    phases: [
      [0, 'Legs swung to the left'],
      [0.25, 'Through the middle'],
      [0.5, 'Legs swung to the right'],
      [0.75, 'Back through the middle'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', moves: 60 },
  },
  'tuck-sit': {
    how: [
      [
        'Start',
        'Sit with your hands flat on the floor beside your hips, fingers pointing forward, and your knees bent in front of you.',
      ],
      [
        'Move',
        'Press down through your hands, straighten your arms, lift your seat off the floor and hold your knees tucked toward your chest.',
      ],
      ['Finish', 'Lower your seat gently.'],
      ['Watch for', 'Depress your shoulders away from your ears and keep your arms locked.'],
    ],
    phases: [
      [0, 'Press down, lift your seat'],
      [0.5, 'Hold, knees tucked, arms straight'],
    ],
    intent: { planted: ['hands'], clear: ['seat'], hands: 'shoulder', elbows: 'straight' },
  },
  'one-leg-lsit': {
    how: [
      [
        'Start',
        'Sit with your hands flat beside your hips, fingers forward, one leg straight and the other knee bent.',
      ],
      [
        'Move',
        'Press down, lift your seat and hold one leg straight out in front of you while the other stays tucked.',
      ],
      ['Finish', 'Lower gently, then switch legs.'],
      ['Watch for', 'Keep your arms locked and your shoulders down.'],
    ],
    phases: [
      [0, 'Press down, lift your seat'],
      [0.5, 'Hold, one leg straight, one tucked'],
    ],
    intent: { planted: ['hands'], clear: ['seat'], hands: 'shoulder', elbows: 'straight' },
  },
  lsit: {
    how: [
      [
        'Start',
        'Sit with your legs straight and your hands flat on the floor beside your hips, fingers forward.',
      ],
      [
        'Move',
        'Press down through your hands, lock your arms, lift your seat and your straight legs off the floor so your body makes an L. Hold.',
      ],
      ['Finish', 'Lower gently.'],
      ['Watch for', 'Depress your shoulders, point your toes and keep your legs together.'],
    ],
    phases: [
      [0, 'Press down, lift your seat and legs'],
      [0.5, 'Hold the L, arms locked'],
    ],
    intent: { planted: ['hands'], clear: ['seat', 'legs'], hands: 'shoulder', elbows: 'straight' },
  },
  'parallette-lsit': {
    how: [
      [
        'Start',
        'Sit between two low parallettes with your hands on them beside your hips and your legs straight in front of you.',
      ],
      [
        'Move',
        'Press down through the parallettes, lock your elbows, lift your seat and legs, and hold your legs level. The extra height gives your legs room to clear the floor.',
      ],
      ['Finish', 'Lower gently.'],
      ['Watch for', 'Lock your elbows, point your toes and keep your shoulders down.'],
    ],
    phases: [
      [0, 'Press down, lift your seat and legs'],
      [0.5, 'Hold the L between the parallettes'],
    ],
    intent: { planted: ['hands'], clear: ['seat', 'legs'], hands: 'shoulder', elbows: 'straight' },
  },
  'v-sit': {
    how: [
      [
        'Start',
        'Sit with your hands flat beside your hips and your legs straight in front of you.',
      ],
      [
        'Move',
        'Press down, lift your seat, then raise your straight legs above horizontal and lean back a little to counterbalance, so your body makes a V.',
      ],
      ['Finish', 'Lower gently.'],
      [
        'Watch for',
        'Keep your arms straight and your legs together. Lean back only as far as you can control.',
      ],
    ],
    phases: [
      [0, 'Press down, lift your seat'],
      [0.4, 'Raise your legs above level'],
      [0.8, 'Hold the V'],
    ],
    intent: { planted: ['hands'], clear: ['seat'], hands: 'shoulder', elbows: 'straight' },
  },
  'side-plank': {
    how: [
      [
        'Start',
        'Lie on your side with your forearm on the floor and your elbow directly under your shoulder, feet stacked.',
      ],
      [
        'Move',
        'Lift your hips so your body makes a straight line from your head to your heels, with your top arm reaching up. Hold, breathing steadily.',
      ],
      ['Finish', 'Lower your hips to rest, then switch sides.'],
      ['Watch for', 'Do not let your hips sag or roll forward.'],
    ],
    phases: [
      [0, 'Straight line, forearm down'],
      [0.5, 'Hold, hips high'],
    ],
    intent: { planted: ['forearms', 'foot'] },
  },
  'side-plank-leg-raise': {
    how: [
      [
        'Start',
        'Lie on your side with your forearm on the floor and your feet stacked. Lift your hips into a straight side plank.',
      ],
      [
        'Move',
        'Raise your top leg toward the ceiling while keeping your hips stacked and still, then lower it slowly.',
      ],
      ['Finish', 'Top leg down, hips high.'],
      ['Watch for', 'Do not let your hips drop or roll as the leg lifts.'],
    ],
    phases: [
      [0, 'Side plank, feet stacked'],
      [0.1, 'Lift your top leg'],
      [0.5, 'Lower it slowly'],
    ],
    intent: { planted: ['forearms', 'foot'], moves: 30 },
  },
  copenhagen: {
    how: [
      [
        'Start',
        'Lie on your side with your forearm on the floor and your top foot on a chair or bench, with your bottom leg hanging free under it.',
      ],
      [
        'Move',
        'Lift your hips so your body is a straight line from head to top foot, with your bottom leg floating beneath the chair. Hold.',
      ],
      ['Finish', 'Lower your hips to rest, then switch sides.'],
      ['Watch for', 'Keep your hips up and your top leg doing the work.'],
    ],
    phases: [
      [0, 'Top foot on the chair, hips lifting'],
      [0.5, 'Hold, bottom leg floating'],
    ],
    intent: { planted: ['forearms'] },
  },
  'tuck-human-flag': {
    how: [
      [
        'Start',
        'Grip a vertical pole with your hands apart, the bottom arm straight and pushing, the top arm pulling.',
      ],
      [
        'Move',
        'Press with the bottom arm and pull with the top arm to lift your body sideways, hips and knees tucked, until your body is horizontal.',
      ],
      ['Finish', 'Lower under control.'],
      ['Watch for', 'Keep your body in line with your arms and your core tight.'],
    ],
    phases: [
      [0, 'Press and pull to lift sideways'],
      [0.5, 'Hold, knees tucked'],
    ],
    intent: { planted: ['holdPole'] },
  },
  'human-flag': {
    how: [
      [
        'Start',
        'Grip a vertical pole with your hands apart, the bottom arm straight and pushing, the top arm pulling.',
      ],
      [
        'Move',
        'Press with the bottom arm and pull with the top arm to lift your whole body sideways until it is horizontal and straight. Hold.',
      ],
      ['Finish', 'Lower under control.'],
      [
        'Watch for',
        'Keep your body straight and your legs together. Build up with the tuck version first.',
      ],
    ],
    phases: [
      [0, 'Press and pull to lift sideways'],
      [0.5, 'Hold, body straight and level'],
    ],
    intent: { planted: ['holdPole'] },
  },
  'arm-circles': {
    how: [
      ['Start', 'Stand tall with your feet hip-width apart and your arms hanging by your sides.'],
      [
        'Move',
        'Swing both arms forward and up and around in big, slow circles with your arms straight. After several circles, reverse the direction.',
      ],
      ['Finish', 'Let your arms come to rest.'],
      [
        'Watch for',
        'Keep your arms long and your shoulders relaxed, and make the circles as big as feels comfortable.',
      ],
    ],
    phases: [
      [0, 'Circle your arms forward'],
      [0.5, 'Reverse the direction'],
    ],
    intent: { planted: ['feet'], armBack: 90, moves: 60 },
  },
  'shoulder-pass': {
    how: [
      [
        'Start',
        'Stand tall holding a towel or band wide in front of your thighs, with straight arms.',
      ],
      [
        'Move',
        'Lift the band overhead and pass it behind your back with your arms straight, then bring it back over the same way. Use a wider grip if your shoulders pinch.',
      ],
      ['Finish', 'Band low in front of your thighs.'],
      ['Watch for', 'Keep your arms straight and your ribs down. Go wider rather than forcing it.'],
    ],
    phases: [
      [0, 'Band low in front'],
      [0.17, 'Pass it overhead'],
      [0.33, 'Behind your back'],
      [0.5, 'Bring it back over'],
      [0.83, 'Band low in front'],
    ],
    intent: { planted: ['feet'], armBack: 95, moves: 60 },
  },
  'cat-cow': {
    how: [
      [
        'Start',
        'Get on all fours with your hands under your shoulders and your knees under your hips.',
      ],
      [
        'Move',
        'Breathe in as you drop your belly and lift your chest and tailbone, then breathe out as you round your back toward the ceiling and tuck your chin. Move slowly with your breath.',
      ],
      ['Finish', 'Back to a flat back.'],
      ['Watch for', 'Move through your whole spine, not just your lower back.'],
    ],
    phases: [
      [0, 'Cow: belly drops, chest lifts'],
      [0.5, 'Cat: round your back, tuck your chin'],
    ],
    intent: { planted: ['hands', 'knees'], moves: 8 },
  },
  'wrist-prep': {
    how: [
      [
        'Start',
        'Get on all fours with your hands flat on the floor under your shoulders, fingers spread. You can turn your fingers forward, out or back.',
      ],
      [
        'Move',
        'Rock gently forward over your hands, then back, keeping your palms flat. Go only as far as feels comfortable.',
      ],
      ['Finish', 'Rest back toward your heels.'],
      ['Watch for', 'Move slowly and stop if you feel pinching in your wrists.'],
    ],
    phases: [
      [0, 'Rock forward over your hands'],
      [0.5, 'Rock back'],
    ],
    intent: { planted: ['hands', 'knees'], moves: 20 },
  },
  'jumping-jacks': {
    how: [
      ['Start', 'Stand with your feet together and your arms by your sides.'],
      [
        'Move',
        'Hop your feet apart as you swing your arms overhead, then hop back to the start. Keep a light, bouncy rhythm.',
      ],
      ['Finish', 'Feet together, arms down.'],
      ['Watch for', 'Land softly on the balls of your feet.'],
    ],
    phases: [
      [0, 'Feet together, arms down'],
      [0.25, 'Hop out, arms swinging up'],
      [0.5, 'Land wide, arms overhead'],
      [0.75, 'Hop back in'],
    ],
    intent: { moves: 50 },
  },
  'child-pose': {
    how: [
      ['Start', 'Kneel on the floor with your big toes together and your knees apart.'],
      [
        'Move',
        'Sit your hips back onto your heels, fold your chest down between your thighs and stretch your arms long in front of you. Breathe slowly into your back.',
      ],
      ['Finish', 'Come up slowly.'],
      [
        'Watch for',
        'Rest your forehead on the floor or a cushion. Widen your knees if your hips feel tight.',
      ],
    ],
    phases: [
      [0, 'Sit back onto your heels'],
      [0.5, 'Breathe slowly into your back'],
    ],
    intent: { planted: ['knees', 'hands'] },
  },
  'cobra-stretch': {
    how: [
      [
        'Start',
        'Lie face down with your hands flat beside your chest, elbows bent and legs straight.',
      ],
      [
        'Move',
        'Press through your hands and lift your chest gently while your hips stay on the floor. Look slightly forward and keep your shoulders away from your ears.',
      ],
      ['Finish', 'Lower slowly.'],
      ['Watch for', 'Use only as much arm strength as you need. Stop if your lower back pinches.'],
    ],
    phases: [
      [0, 'Hands under shoulders, hips down'],
      [0.1, 'Press and lift your chest'],
      [0.5, 'Lower slowly'],
    ],
    intent: { planted: ['hands'], moves: 15 },
  },
  'couch-stretch': {
    how: [
      [
        'Start',
        'Kneel with your back foot up on a sofa or wall behind you and your front foot flat on the floor, in a long lunge.',
      ],
      [
        'Move',
        'Tuck your pelvis under and squeeze your glute so you feel the stretch along the front of your back hip and thigh. Hold, then switch sides.',
      ],
      ['Finish', 'Come out slowly.'],
      ['Watch for', 'Do not arch your lower back. Tuck your pelvis and keep your chest tall.'],
    ],
    phases: [
      [0, 'Back foot up the couch'],
      [0.5, 'Tuck your pelvis, push your hips forward'],
    ],
    intent: { planted: ['foot'], hipExt: 65 },
  },
  'seated-hamstring': {
    how: [
      ['Start', 'Sit on the floor with your legs straight out in front of you and your back tall.'],
      [
        'Move',
        'Fold forward from your hips, reaching toward your feet with a long back, until you feel a stretch along the backs of your legs. Hold and breathe.',
      ],
      ['Finish', 'Roll up slowly.'],
      [
        'Watch for',
        'Fold from the hips, not by rounding your shoulders. Bend your knees slightly if you need to.',
      ],
    ],
    phases: [
      [0, 'Legs long, sit tall'],
      [0.1, 'Fold forward from your hips'],
      [0.5, 'Hold and breathe'],
    ],
    intent: { planted: ['seat'] },
  },
  'doorway-chest': {
    how: [
      [
        'Start',
        'Stand next to a wall or door frame with one forearm up it at shoulder height and your elbow bent, feet apart.',
      ],
      [
        'Move',
        'Turn your body away from that arm until you feel your chest and the front of your shoulder open. Hold, then switch sides.',
      ],
      ['Finish', 'Turn back and release.'],
      ['Watch for', 'Do not shrug or force it. Keep your arm lightly on the wall.'],
    ],
    phases: [
      [0, 'Forearm on the wall'],
      [0.5, 'Turn your body away'],
    ],
    intent: { planted: ['feet', 'wallZ'], armBack: 95, moves: 12 },
  },
  'deep-squat-hold': {
    how: [
      [
        'Start',
        'Stand with your feet a little wider than your shoulders and your toes turned slightly out.',
      ],
      [
        'Move',
        'Sink into a deep squat with your heels down, press your elbows gently against your knees to open your hips, and keep your chest tall. Hold and breathe.',
      ],
      ['Finish', 'Stand up slowly.'],
      [
        'Watch for',
        'Hold on to something or put a rolled towel under your heels if your heels lift.',
      ],
    ],
    phases: [
      [0, 'Heels down, chest tall'],
      [0.5, 'Elbows press the knees out'],
    ],
    intent: { planted: ['feet'], feet: 'wide' },
  },
  'wall-lat-stretch': {
    how: [
      [
        'Start',
        "Stand facing a wall about a leg's length away and put both hands on it at about hip height.",
      ],
      [
        'Move',
        'Walk your hips back and let your chest sink toward the floor until you feel a stretch along your sides and under your arms. Hold and breathe.',
      ],
      ['Finish', 'Walk back in.'],
      ['Watch for', 'Keep your arms straight and your back flat.'],
    ],
    phases: [
      [0, 'Hands on the wall, hips back'],
      [0.5, 'Let your chest sink'],
    ],
    intent: { planted: ['wallhands', 'feet'] },
  },
  'neck-tilts': {
    how: [
      ['Start', 'Stand or sit tall with your shoulders relaxed.'],
      [
        'Move',
        'Drop your chin to your chest, then look gently up. Then tilt each ear toward its shoulder, one side at a time. Move slowly and breathe.',
      ],
      ['Finish', 'Come back to the middle.'],
      ['Watch for', 'Do not force it or roll your head all the way around.'],
    ],
    phases: [
      [0, 'Neutral'],
      [0.1, 'Drop your chin to your chest'],
      [0.2, 'Back to the middle'],
      [0.33, 'Look gently up'],
      [0.45, 'Back to the middle'],
      [0.58, 'Tilt your right ear toward your shoulder'],
      [0.7, 'Back to the middle'],
      [0.83, 'Tilt your left ear toward your shoulder'],
    ],
    intent: { planted: ['feet'] },
  },
  'shoulder-rolls': {
    how: [
      ['Start', 'Stand tall with your arms relaxed by your sides.'],
      [
        'Move',
        'Lift your shoulders up toward your ears, roll them back and down in big smooth circles. After a few, roll the other way.',
      ],
      ['Finish', 'Let your shoulders settle down.'],
      ['Watch for', 'Keep your neck long and make the circles as big as you can.'],
    ],
    phases: [
      [0, 'Lift your shoulders'],
      [0.25, 'Roll them back'],
      [0.5, 'Down'],
      [0.75, 'Forward and up'],
    ],
    intent: { planted: ['feet'], moves: 12 },
  },
  'reach-up': {
    how: [
      ['Start', 'Stand tall with your feet hip-width apart and your arms by your sides.'],
      [
        'Move',
        'Reach both arms overhead and lean back slightly, lengthening through your sides. Then reach over to one side and the other, keeping both arms long.',
      ],
      ['Finish', 'Lower your arms slowly.'],
      ['Watch for', 'Keep your ribs down and do not arch your lower back.'],
    ],
    phases: [
      [0, 'Arms by your sides'],
      [0.17, 'Reach up and lean back slightly'],
      [0.33, 'Lean to the right'],
      [0.5, 'Back to the middle'],
      [0.67, 'Lean to the left'],
      [0.83, 'Back to the middle'],
    ],
    intent: { planted: ['feet'], moves: 60 },
  },
  'forward-fold': {
    how: [
      ['Start', 'Stand with your feet hip-width apart and your knees slightly bent.'],
      [
        'Move',
        'Fold forward from your hips and let your head and arms hang heavy. Relax your back and breathe, bending your knees as much as you need.',
      ],
      ['Finish', 'Roll up slowly, one vertebra at a time.'],
      ['Watch for', 'Keep a soft bend in your knees and do not bounce.'],
    ],
    phases: [
      [0, 'Stand tall'],
      [0.1, 'Bend your knees and fold forward'],
      [0.5, 'Let your head and arms hang heavy'],
    ],
    intent: { planted: ['feet'], hipFlex: 172, moves: 60 },
  },
  'downward-dog': {
    how: [
      [
        'Start',
        'Start on all fours, then lift your hips up and back so your body makes an upside-down V, with your hands about shoulder-width apart.',
      ],
      [
        'Move',
        'Press your hands into the floor and your heels toward it, with your arms long. Pedal your feet: bend one knee while the other heel presses down, then switch.',
      ],
      ['Finish', 'Lower to your knees to rest.'],
      [
        'Watch for',
        'Keep your spine long and your head between your arms. Bend your knees if your hamstrings are tight.',
      ],
    ],
    phases: [
      [0, 'Hips high, heels reaching down'],
      [0.5, 'Pedal: bend the other knee'],
    ],
    intent: { planted: ['hands', 'foot'], hands: 'shoulder', moves: 18 },
  },
  'low-lunge': {
    how: [
      [
        'Start',
        'Kneel in a long lunge with your front foot flat and your back knee on the floor, hands on your front thigh or the floor.',
      ],
      [
        'Move',
        'Tuck your pelvis under and gently push your hips forward until you feel a stretch along the front of your back hip. Hold, then switch sides.',
      ],
      ['Finish', 'Come out slowly.'],
      ['Watch for', 'Do not arch your lower back. Keep your front knee over your ankle.'],
    ],
    phases: [
      [0, 'Back knee down, front foot flat'],
      [0.5, 'Tuck your pelvis, push your hips forward'],
    ],
    intent: { planted: ['foot'], hipExt: 72 },
  },
  'quad-stretch': {
    how: [
      ['Start', 'Stand tall, holding on to a wall or chair if you need balance.'],
      [
        'Move',
        'Bend one knee and hold that ankle behind you, keeping your knees close together. Push your hip forward slightly until you feel the front of your thigh stretch. Hold, then switch.',
      ],
      ['Finish', 'Release the foot.'],
      ['Watch for', 'Do not arch your back, and keep your standing knee soft.'],
    ],
    phases: [
      [0, 'Hold your ankle behind you'],
      [0.5, 'Push your hip forward'],
    ],
    intent: { planted: ['foot'], meet: [['handAny', 'ankleAny']] },
  },
  'calf-stretch': {
    how: [
      [
        'Start',
        'Stand facing a wall and put your hands on it. Step one foot back with that leg straight.',
      ],
      [
        'Move',
        'Press your back heel into the floor and lean toward the wall until you feel a stretch in your calf. Hold, then switch legs.',
      ],
      ['Finish', 'Step in slowly.'],
      ['Watch for', 'Keep the back heel down and your back leg straight.'],
    ],
    phases: [
      [0, 'Hands on the wall, back heel down'],
      [0.5, 'Lean in, heel stays down'],
    ],
    intent: { planted: ['wallhands', 'foot'] },
  },
  'chest-opener': {
    how: [
      ['Start', 'Stand tall and clasp your hands together behind your back.'],
      [
        'Move',
        'Straighten your arms and lift them slightly away from your back while you open your chest and pull your shoulder blades together. Hold and breathe.',
      ],
      ['Finish', 'Release your hands slowly.'],
      ['Watch for', 'Do not arch your lower back. Keep your ribs down.'],
    ],
    phases: [
      [0, 'Clasp your hands behind your back'],
      [0.5, 'Straighten and lift your arms'],
    ],
    intent: { planted: ['feet'], armBack: 95 },
  },
  'seated-cat-cow': {
    how: [
      ['Start', 'Sit tall on a chair with your feet flat and your hands on your knees.'],
      [
        'Move',
        'Breathe in as you arch your chest forward and look up, then breathe out as you round your back and tuck your chin. Move slowly with your breath.',
      ],
      ['Finish', 'Sit tall.'],
      ['Watch for', 'Move through your whole spine and keep your feet on the floor.'],
    ],
    phases: [
      [0, 'Arch your chest forward'],
      [0.5, 'Round your back'],
    ],
    intent: { planted: ['seat', 'feet'] },
  },
  'wall-angels': {
    how: [
      [
        'Start',
        'Face a wall with your forearms on it in a W shape, elbows bent and below your shoulders.',
      ],
      [
        'Move',
        'Slide your arms up the wall to a Y shape, keeping your forearms and wrists against it, then slide back down to the W.',
      ],
      ['Finish', 'Arms back in the W.'],
      ['Watch for', 'Keep your ribs down and do not let your lower back arch.'],
    ],
    phases: [
      [0, 'W shape against the wall'],
      [0.17, 'Slide your arms up'],
      [0.33, 'Y shape, arms long'],
      [0.67, 'Slide back down'],
    ],
    intent: { planted: ['feet'], moves: 40 },
  },
  'pigeon-stretch': {
    how: [
      [
        'Start',
        'Start on all fours. Bring one knee forward and lay that shin across in front of you, with your back leg long behind.',
      ],
      [
        'Move',
        'Fold forward gently over your front leg with your arms long on the floor until you feel a stretch in the hip of the front leg. Hold, then switch sides.',
      ],
      ['Finish', 'Come up slowly and switch.'],
      [
        'Watch for',
        'Use a cushion under your hip if it does not reach the floor. Do not force your knee.',
      ],
    ],
    phases: [
      [0, 'Front shin across, torso upright'],
      [0.5, 'Fold forward over your front leg'],
    ],
    intent: { planted: ['hands', 'foot'], hipExt: 50 },
  },
  'figure-4': {
    how: [
      ['Start', 'Lie on your back with your knees bent and your feet flat.'],
      [
        'Move',
        'Cross one ankle over the opposite knee, then pull that thigh toward your chest until you feel a stretch in the crossed hip. Hold, then switch sides.',
      ],
      ['Finish', 'Lower your feet and switch.'],
      ['Watch for', 'Keep your head relaxed and your crossed foot flexed to protect your knee.'],
    ],
    phases: [
      [0, 'Ankle over the opposite knee'],
      [0.5, 'Pull the thigh toward you'],
    ],
    intent: { planted: ['seat'], faces: 'up' },
  },
  'legs-up-wall': {
    how: [
      [
        'Start',
        'Sit sideways next to a wall, then swing your legs up it as you lie back, with your hips close to the wall.',
      ],
      [
        'Move',
        'Rest your legs up the wall with your arms by your sides and breathe slowly. Stay as long as it feels good.',
      ],
      ['Finish', 'Bend your knees and roll to one side to come up.'],
      ['Watch for', 'Move your hips a little further from the wall if your hamstrings pull.'],
    ],
    phases: [
      [0, 'Legs up the wall'],
      [0.5, 'Breathe and relax'],
    ],
    intent: { planted: ['seat'], faces: 'up' },
  },
  'chest-to-wall-handstand': {
    how: [
      [
        'Start',
        'Place your hands on the floor about 20 cm from a wall, shoulder-width apart, and walk your feet up the wall until your belly faces the wall and your body is a long straight line.',
      ],
      [
        'Move',
        'Push the floor away through straight arms, keep your ribs tucked and look between your hands. Hold, breathing steadily.',
      ],
      ['Finish', 'Walk your feet down, one at a time.'],
      [
        'Watch for',
        'Keep your arms locked, your shoulders open and your body long. Do not arch your lower back.',
      ],
    ],
    phases: [
      [0, 'Arms straight, belly toward the wall'],
      [0.5, 'Push the floor away and hold'],
    ],
    intent: { planted: ['hands'], hands: 'shoulder', elbows: 'straight' },
  },
  'kick-up': {
    how: [
      [
        'Start',
        'Stand facing a wall with your hands on the floor about 30 cm from it, shoulder-width apart, one foot forward.',
      ],
      [
        'Move',
        'Kick your back leg up, then bring the other leg to meet it, pushing through straight arms until your heels reach the wall. Land softly and repeat.',
      ],
      ['Finish', 'Come down softly, one foot at a time.'],
      ['Watch for', 'Kick with control, not with force, and keep your arms straight.'],
    ],
    phases: [
      [0, 'Hands down, back leg ready'],
      [0.2, 'Kick one leg up'],
      [0.5, 'Bring the second leg up'],
      [0.75, 'Heels at the wall'],
    ],
    intent: { planted: ['hands'], hands: 'shoulder', moves: 60 },
  },
  'back-to-wall-handstand': {
    how: [
      [
        'Start',
        'Sit with your back to a wall, then place your hands on the floor and kick up so your heels rest lightly on the wall, with your hands about 20 cm from it.',
      ],
      [
        'Move',
        'Stack your wrists, shoulders and hips in one line. Keep your heels barely touching the wall and press the floor away with straight arms. Hold.',
      ],
      ['Finish', 'Come down one foot at a time.'],
      ['Watch for', 'Do not let your lower back arch and your ribs flare. Keep your body tight.'],
    ],
    phases: [
      [0, 'Heels on the wall, arms straight'],
      [0.5, 'Stack wrists, shoulders and hips'],
    ],
    intent: { planted: ['hands'], hands: 'shoulder', elbows: 'straight' },
  },
  'handstand-shoulder-taps': {
    how: [
      ['Start', 'Hold a handstand against a wall, arms straight, hands shoulder-width apart.'],
      [
        'Move',
        'Shift your weight onto one hand and lift the other to tap the opposite shoulder. Put it back, then do the other side. Keep your body line steady.',
      ],
      ['Finish', 'Both hands down, steady.'],
      ['Watch for', 'Move slowly and keep your hips from swinging.'],
    ],
    phases: [
      [0, 'Handstand, weight even'],
      [0.25, 'Weight on the right hand, tap with the left'],
      [0.5, 'Both hands down'],
      [0.75, 'Weight on the left hand, tap with the right'],
    ],
    intent: { planted: ['hand'], lifts: true, allow: ['hand sinks'], moves: 30 },
  },
  'freestanding-handstand': {
    how: [
      [
        'Start',
        'Kick up into a handstand away from the wall, hands about shoulder-width apart, arms locked and body in one line.',
      ],
      [
        'Move',
        'Use your fingertips to correct your balance: press your fingers down if you start to fall forward, and your heels of the hands if you fall back. Keep your ribs tucked and look between your hands.',
      ],
      ['Finish', 'Come down by cartwheeling out or stepping down.'],
      ['Watch for', 'Do not hold your breath and keep your arms straight.'],
    ],
    phases: [
      [0, 'Steady handstand, arms locked'],
      [0.5, 'Fingertips correct your balance'],
    ],
    intent: { planted: ['hands'], hands: 'shoulder', elbows: 'straight' },
  },
  'tripod-headstand': {
    how: [
      [
        'Start',
        'Kneel and place the top of your head on the floor with your hands on the floor beside it, behind your head, to form a triangle.',
      ],
      [
        'Move',
        'Walk your feet in, lift your hips over your shoulders and raise your legs up slowly, with most of your weight on your hands. Hold the line, then lower with control.',
      ],
      ['Finish', 'Lower your feet slowly to the floor.'],
      ['Watch for', 'Keep the weight in your hands, not your neck.'],
    ],
    phases: [
      [0, 'Head and hands in a triangle'],
      [0.5, 'Legs up, weight in your hands'],
    ],
    intent: { planted: ['hands', 'head'], elbows: 'back' },
  },
  headstand: {
    how: [
      [
        'Start',
        'Kneel and rest your forearms on the floor with your hands clasped, elbows about shoulder-width apart. Place the top of your head on the floor against your hands.',
      ],
      [
        'Move',
        'Walk your feet in, lift your hips over your shoulders and raise your legs up. Press your forearms into the floor so your neck stays long. Hold, then lower with control.',
      ],
      ['Finish', 'Lower your feet slowly to the floor.'],
      ['Watch for', 'Keep the weight in your forearms and shoulders, not your head.'],
    ],
    phases: [
      [0, 'Forearms down, head against your hands'],
      [0.5, 'Legs up, hips stacked over shoulders'],
    ],
    intent: { planted: ['head', 'forearms'] },
  },
  'dolphin-pose': {
    how: [
      [
        'Start',
        'Start on all fours, then lower onto your forearms with your elbows under your shoulders.',
      ],
      [
        'Move',
        'Lift your hips up and back so your body makes an upside-down V, with your legs as straight as you can. Let your head hang and press the floor away with your forearms. Hold.',
      ],
      ['Finish', 'Lower your knees to rest.'],
      ['Watch for', 'Keep your spine long. Bend your knees if your hamstrings are tight.'],
    ],
    phases: [
      [0, 'Forearms down, hips high'],
      [0.5, 'Head heavy, press the floor away'],
    ],
    intent: { planted: ['forearms', 'feet'], elbows: 'back' },
  },
  'tripod-frog': {
    how: [
      [
        'Start',
        'Place your hands on the floor and the top of your head on the floor to make a triangle, then bend your elbows and rest your knees on your upper arms.',
      ],
      [
        'Move',
        'Lean forward and shift your weight into your hands until your feet float off the floor, keeping your knees on your arms. Hold, then lower your feet.',
      ],
      ['Finish', 'Lower your feet slowly.'],
      ['Watch for', 'Keep the weight on your hands and use your head only as a light third point.'],
    ],
    phases: [
      [0, 'Knees on your upper arms'],
      [0.5, 'Feet floating, weight on your hands'],
    ],
    intent: { planted: ['hands', 'head'], clear: ['legs'], elbows: 'back' },
  },
  'wall-tripod-headstand': {
    how: [
      [
        'Start',
        'Place your head and hands on the floor in a triangle near a wall, with your hands behind your head.',
      ],
      [
        'Move',
        'Walk your feet in, lift your hips over your shoulders and rest your heels against the wall. Keep most of your weight in your hands. Hold, then lower.',
      ],
      ['Finish', 'Lower your feet slowly.'],
      ['Watch for', 'The wall is only a backup. Aim to need less and less of it.'],
    ],
    phases: [
      [0, 'Head and hands in a triangle'],
      [0.5, 'Heels on the wall, weight in your hands'],
    ],
    intent: { planted: ['hands', 'head'], elbows: 'back' },
  },
  'tripod-tuck': {
    how: [
      ['Start', 'Place your head and hands on the floor in a triangle, hands behind your head.'],
      [
        'Move',
        'Walk your feet in, lift your hips over your shoulders and bring your knees in toward your chest. Hold the tuck with your hips over your shoulders, then lower.',
      ],
      ['Finish', 'Lower your feet slowly.'],
      [
        'Watch for',
        'Tuck tight to keep your weight over your hands. Straighten the legs only when it feels steady.',
      ],
    ],
    phases: [
      [0, 'Head and hands in a triangle'],
      [0.5, 'Knees tucked, hips over your shoulders'],
    ],
    intent: { planted: ['hands', 'head'], elbows: 'back' },
  },
  'frog-stand': {
    how: [
      [
        'Start',
        'Squat with your hands on the floor shoulder-width apart, fingers spread, and bend your elbows slightly.',
      ],
      [
        'Move',
        'Rest your knees on your upper arms, lean forward and shift your weight onto your hands until your feet float off the floor. Hold.',
      ],
      ['Finish', 'Lower your feet slowly.'],
      ['Watch for', 'Gaze a little ahead of your hands and keep your weight over them.'],
    ],
    phases: [
      [0, 'Knees on your upper arms'],
      [0.5, 'Lean forward, feet floating'],
    ],
    intent: { planted: ['hands'], clear: ['legs'] },
  },
  crow: {
    how: [
      [
        'Start',
        'Squat with your hands on the floor shoulder-width apart, fingers spread, and your knees wide.',
      ],
      [
        'Move',
        'Place your knees high on the backs of your upper arms, lean forward and lift both feet off the floor. Gaze slightly forward and hold.',
      ],
      ['Finish', 'Lower your feet slowly.'],
      ['Watch for', 'Bend your elbows a little and keep your weight over your hands.'],
    ],
    phases: [
      [0, 'Knees high on your upper arms'],
      [0.5, 'Lean forward, feet lifted'],
    ],
    intent: { planted: ['hands'], clear: ['legs'] },
  },
  crane: {
    how: [
      [
        'Start',
        'Squat with your hands on the floor shoulder-width apart and your knees tucked in toward your armpits.',
      ],
      [
        'Move',
        'Straighten your arms as you lean forward and lift your hips, with your knees tucked, until your feet float. Hold.',
      ],
      ['Finish', 'Lower your feet slowly.'],
      ['Watch for', 'Lock your arms, round your upper back and look a little ahead of your hands.'],
    ],
    phases: [
      [0, 'Knees in your armpits'],
      [0.5, 'Straighten your arms, lift your hips'],
    ],
    intent: { planted: ['hands'], clear: ['legs'], elbows: 'straight' },
  },
  'elbow-lever': {
    how: [
      [
        'Start',
        'Squat with your hands on the floor, fingers pointing back or out, and your elbows pressed into your lower belly or hip crease.',
      ],
      [
        'Move',
        'Lean forward and shift your weight onto your hands until your feet float off the floor, with your body horizontal and your legs straight behind you. Hold.',
      ],
      ['Finish', 'Lower your feet slowly.'],
      ['Watch for', 'Keep your elbows glued into your body and your core tight.'],
    ],
    phases: [
      [0, 'Elbows in your hip crease'],
      [0.5, 'Lean forward, body horizontal'],
    ],
    intent: {
      planted: ['hands'],
      clear: ['legs'],
      allow: ['forearm folds back', 'elbow juts forward'],
    },
  },
  'planche-lean': {
    how: [
      [
        'Start',
        'Get into a push-up position with your hands turned slightly out and your fingers spread.',
      ],
      [
        'Move',
        'Keep your arms straight and lean your shoulders forward past your hands, as far as you can while holding your body straight. Hold.',
      ],
      ['Finish', 'Rock back to a plank.'],
      ['Watch for', 'Keep your arms locked and your glutes tight. Do not let your hips sag.'],
    ],
    phases: [
      [0, 'Straight arms, plank position'],
      [0.5, 'Shoulders forward past your hands'],
    ],
    intent: {
      planted: ['hands', 'feet'],
      elbows: 'straight',
      allow: ['forearm folds back', 'elbow juts forward'],
    },
  },
  'tuck-planche': {
    how: [
      [
        'Start',
        'Squat with your hands on the floor, fingers pointing slightly out, and your arms straight.',
      ],
      [
        'Move',
        'Lean forward until your shoulders are over or past your hands, round your back and tuck your knees to your chest, then lift your feet off the floor. Hold.',
      ],
      ['Finish', 'Lower your feet slowly.'],
      ['Watch for', 'Keep your arms straight and push the floor away through your shoulders.'],
    ],
    phases: [
      [0, 'Squat, arms straight'],
      [0.5, 'Round your back, tuck, feet lifted'],
    ],
    intent: {
      planted: ['hands'],
      clear: ['legs'],
      elbows: 'straight',
      allow: ['forearm folds back', 'elbow juts forward'],
    },
  },
  'adv-tuck-planche': {
    how: [
      ['Start', 'Get into a tuck planche with your arms straight and your knees tucked.'],
      [
        'Move',
        'Flatten your back and move your hips back so they are level with your shoulders, keeping your knees tucked tight. Hold.',
      ],
      ['Finish', 'Lower your feet slowly.'],
      ['Watch for', 'Push your shoulders far over your hands and keep your arms locked.'],
    ],
    phases: [
      [0, 'Tuck planche, arms straight'],
      [0.5, 'Flat back, knees tucked tight'],
    ],
    intent: {
      planted: ['hands'],
      clear: ['legs'],
      elbows: 'straight',
      allow: ['forearm folds back', 'elbow juts forward'],
    },
  },
  'straddle-planche': {
    how: [
      ['Start', 'Start from an advanced tuck planche, arms straight.'],
      [
        'Move',
        'Extend your legs out wide in a straddle and lean forward so your body stays level and your weight stays over your hands. Hold.',
      ],
      ['Finish', 'Bring your legs in and lower slowly.'],
      [
        'Watch for',
        'Keep your arms locked and your toes pointed. The wider the straddle, the easier.',
      ],
    ],
    phases: [
      [0, 'Advanced tuck, arms straight'],
      [0.5, 'Legs wide and straight, body level'],
    ],
    intent: {
      planted: ['hands'],
      clear: ['legs'],
      elbows: 'straight',
      allow: ['forearm folds back', 'elbow juts forward'],
    },
  },
  'full-planche': {
    how: [
      ['Start', 'Start from a straddle planche, arms straight.'],
      [
        'Move',
        'Bring your legs together so your whole body is a straight line parallel to the floor, with your shoulders far over your hands. Hold.',
      ],
      ['Finish', 'Lower your feet slowly.'],
      ['Watch for', 'Lock your arms, squeeze your glutes and point your toes.'],
    ],
    phases: [
      [0, 'Straddle planche'],
      [0.5, 'Legs together, body level'],
    ],
    intent: {
      planted: ['hands'],
      clear: ['legs'],
      elbows: 'straight',
      allow: ['forearm folds back', 'elbow juts forward'],
    },
  },
  'skin-the-cat': {
    how: [
      ['Start', 'Hang from a bar with a firm overhand grip and your arms straight.'],
      [
        'Move',
        'Tuck your knees and rotate your whole body backward through your shoulders until you hang upside down behind the bar, then reverse the movement slowly.',
      ],
      ['Finish', 'Come back to a hang and lower to the floor.'],
      ['Watch for', 'Go slowly and keep your grip firm. Stop where your shoulders feel unsafe.'],
    ],
    phases: [
      [0, 'Hang from the bar'],
      [0.2, 'Tuck and rotate backward'],
      [0.5, 'Hanging behind the bar'],
      [0.8, 'Reverse and return'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', moves: 80 },
  },
  'tuck-front-lever': {
    how: [
      ['Start', 'Hang from a bar with straight arms and your shoulders pulled down.'],
      [
        'Move',
        'Pull your shoulders down and back and lift your hips and knees until your tucked body is horizontal, with your arms still straight. Hold.',
      ],
      ['Finish', 'Lower your hips slowly.'],
      [
        'Watch for',
        'Keep your arms straight and your back round, with your hips in line with your shoulders.',
      ],
    ],
    phases: [
      [0, 'Hang, straight arms'],
      [0.5, 'Body horizontal, knees tucked'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', elbows: 'straight' },
  },
  'adv-tuck-front-lever': {
    how: [
      ['Start', 'Hang from a bar with straight arms and your shoulders pulled down.'],
      [
        'Move',
        'Lift into a tuck front lever, then flatten your back and extend your hips away from your chest, keeping your knees tucked. Hold.',
      ],
      ['Finish', 'Lower your hips slowly.'],
      ['Watch for', 'Keep your arms straight and your shoulders pulled down.'],
    ],
    phases: [
      [0, 'Hang, straight arms'],
      [0.5, 'Flat back, hips extended, knees tucked'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', elbows: 'straight' },
  },
  'straddle-front-lever': {
    how: [
      ['Start', 'Hang from a bar with straight arms and your shoulders pulled down.'],
      [
        'Move',
        'Lift your body until it is horizontal with your legs wide and straight in a straddle. Hold, with your arms straight.',
      ],
      ['Finish', 'Lower slowly.'],
      [
        'Watch for',
        'Keep your toes pointed and your body level. The wider the straddle, the easier.',
      ],
    ],
    phases: [
      [0, 'Hang, straight arms'],
      [0.5, 'Body horizontal, legs wide'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', elbows: 'straight' },
  },
  'full-front-lever': {
    how: [
      ['Start', 'Hang from a bar with straight arms and your shoulders pulled down.'],
      [
        'Move',
        'Lift your whole body until it is one straight horizontal line, face up, with your legs together. Hold, with your arms straight.',
      ],
      ['Finish', 'Lower slowly.'],
      ['Watch for', 'Squeeze your glutes and keep your shoulders pulled down.'],
    ],
    phases: [
      [0, 'Hang, straight arms'],
      [0.5, 'Whole body in one horizontal line'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', elbows: 'straight' },
  },
  'back-lever': {
    how: [
      [
        'Start',
        'Hang from a bar with a firm grip, then rotate backward through your shoulders so your body is face down behind the bar.',
      ],
      [
        'Move',
        'Lower your body until it is horizontal, face down, with your arms straight and your hips open. Hold.',
      ],
      ['Finish', 'Rotate back to the hang slowly.'],
      ['Watch for', 'Go slowly and stop where your shoulders feel safe. Keep your hips open.'],
    ],
    phases: [
      [0, 'Rotate behind the bar'],
      [0.5, 'Body horizontal, face down'],
    ],
    intent: { planted: ['grip'], hands: 'shoulder', elbows: 'straight' },
  },
  'cross-body-shoulder': {
    how: [
      ['Start', 'Stand tall with your feet hip-width apart and your shoulders relaxed.'],
      [
        'Move',
        'Lift one arm straight in front of you and swing it across your chest at shoulder height. Hook your other hand around that arm just above the elbow and draw it gently toward you. Turn your head the other way. Hold, then switch sides.',
      ],
      ['Finish', 'Let the arm go and shake it out.'],
      [
        'Watch for',
        'Keep your shoulder down, away from your ear. Pull on the arm, not the elbow joint.',
      ],
    ],
    phases: [
      [0, 'Arm across your chest'],
      [0.55, 'Draw it in with your other hand'],
    ],
    intent: { planted: ['feet'] },
  },
  'neck-turns': {
    how: [
      ['Start', 'Sit or stand tall with your shoulders relaxed and your eyes level.'],
      [
        'Move',
        'Turn your head slowly to the right as if looking over your shoulder, and hold for a breath or two. Come back to the middle, then turn to the left. Keep your chin level the whole way.',
      ],
      ['Finish', 'Come back to the middle and relax your jaw.'],
      [
        'Watch for',
        'Turn only your head, not your shoulders. Stop where it feels like a gentle stretch.',
      ],
    ],
    phases: [
      [0, 'Eyes forward'],
      [0.25, 'Turn to look over your right shoulder'],
      [0.5, 'Back to the middle'],
      [0.75, 'Turn to look over your left shoulder'],
    ],
    intent: { planted: ['feet'] },
  },
  'wrist-extensor': {
    how: [
      [
        'Start',
        'Stand tall and reach one arm straight out in front of you with the palm facing down.',
      ],
      [
        'Move',
        'Let your hand drop so your fingers point to the floor. With your other hand, gently draw the fingers back toward your body until you feel a stretch along the top of your forearm. Hold, then switch.',
      ],
      ['Finish', 'Release and shake your wrist out.'],
      [
        'Watch for',
        'Keep your elbow straight but not locked, and pull gently. It should never feel sharp.',
      ],
    ],
    phases: [
      [0, 'Arm out, palm down'],
      [0.6, 'Ease your fingers toward you'],
    ],
    intent: { planted: ['feet'] },
  },
  'sphinx-pose': {
    how: [
      ['Start', 'Lie on your belly with your legs long and your forearms on the floor.'],
      [
        'Move',
        'Place your elbows under your shoulders with your forearms flat and pointing forward. Press your forearms down and lift your chest, keeping your hips on the floor. Breathe slowly and hold.',
      ],
      ['Finish', 'Lower your chest slowly to the floor.'],
      [
        'Watch for',
        'Keep your neck long and your shoulders away from your ears. Stop if you feel pinching in your lower back.',
      ],
    ],
    phases: [
      [0, 'Lying on your belly'],
      [0.55, 'Press your forearms down, lift your chest'],
    ],
    intent: { planted: ['hands', 'feet'], allow: ['elbow juts forward'] },
  },
  'happy-baby': {
    how: [
      ['Start', 'Lie on your back and draw both knees up toward your chest.'],
      [
        'Move',
        'Open your knees wide, wider than your ribs, and bring your shins upright. Hold the outsides of your feet with your hands, or your ankles if that is easier. Gently pull your knees toward the floor beside your ribs and rock softly from side to side.',
      ],
      ['Finish', 'Let go and hug your knees in.'],
      ['Watch for', 'Keep your head and tailbone on the floor. Do not pull hard on your knees.'],
    ],
    phases: [
      [0, 'Knees wide, holding your feet'],
      [0.25, 'Rock gently to one side'],
      [0.75, 'Rock gently to the other side'],
    ],
    intent: { planted: ['seat'], faces: 'up' },
  },
  'lying-twist': {
    how: [
      [
        'Start',
        'Lie on your back with your arms out to the sides in a T and your knees bent, feet flat.',
      ],
      [
        'Move',
        'Lift your feet and drop both knees together to one side, toward the floor. Keep your shoulders flat on the floor and turn your head the other way. Hold, then bring your knees back up and drop them to the other side.',
      ],
      ['Finish', 'Bring your knees back to the middle and hug them in.'],
      [
        'Watch for',
        'Let your knees rest on a cushion if they do not reach the floor. Both shoulders stay down.',
      ],
    ],
    phases: [
      [0, 'Knees up, arms wide'],
      [0.2, 'Drop your knees to one side'],
      [0.5, 'Back to the middle'],
      [0.7, 'Drop your knees to the other side'],
    ],
    intent: { planted: ['seat'], faces: 'up', allow: ['elbow juts forward'] },
  },
  'seated-twist': {
    how: [
      ['Start', 'Sit on the floor with your legs straight and your back tall.'],
      [
        'Move',
        'Bend one knee and cross that foot over the other leg, flat on the floor outside the straight knee. Hook your opposite elbow outside the raised knee and place your other hand on the floor behind you. Sit tall and turn your chest toward the bent knee, then look over your back shoulder. Hold, then switch sides.',
      ],
      ['Finish', 'Unwind slowly and sit tall.'],
      [
        'Watch for',
        'Lengthen your spine before you twist. Turn from your waist, not by pulling on the knee.',
      ],
    ],
    phases: [
      [0, 'Sit tall, one knee crossed over'],
      [0.5, 'Hook the elbow and turn your chest'],
    ],
    intent: { planted: ['seat'] },
  },
  'box-hamstring': {
    how: [
      [
        'Start',
        'Stand facing a low, sturdy step or box and place one heel on it with your leg long and your toes pointing up.',
      ],
      [
        'Move',
        'Keep your standing leg slightly soft. Hinge forward from your hips with a long, flat back and reach your hands toward your raised foot until you feel a stretch behind that thigh. Hold, then switch legs.',
      ],
      ['Finish', 'Stand up slowly.'],
      [
        'Watch for',
        'Keep your back flat rather than rounding, and use a lower step if your knee feels locked.',
      ],
    ],
    phases: [
      [0, 'Heel up, standing tall'],
      [0.55, 'Hinge forward with a long back'],
    ],
    intent: { planted: ['feet'], allow: ['elbow juts forward'] },
  },
  'upper-back-round': {
    how: [
      [
        'Start',
        'Stand tall with your feet hip-width apart and clasp your hands together in front of your chest.',
      ],
      [
        'Move',
        'Straighten your arms in front of you, push your palms away and round your upper back like a hug, letting your head drop between your arms. Breathe into the space between your shoulder blades. Hold.',
      ],
      ['Finish', 'Release your hands and roll back up.'],
      ['Watch for', 'Keep your knees soft and stay tall through your legs.'],
    ],
    phases: [
      [0, 'Hands clasped in front'],
      [0.55, 'Push away and round your upper back'],
    ],
    intent: { planted: ['feet'] },
  },
  'thread-needle': {
    how: [
      [
        'Start',
        'Start on all fours with your hands under your shoulders and your knees under your hips.',
      ],
      [
        'Move',
        'Slide one arm along the floor under your body, palm up, and lower that shoulder and the side of your head to the floor. Keep your hips over your knees and let your chest turn. Hold, then press back up and switch sides.',
      ],
      ['Finish', 'Press back to all fours.'],
      [
        'Watch for',
        'Keep your hips high and over your knees. Move slowly and stop if your shoulder feels pinched.',
      ],
    ],
    phases: [
      [0, 'On all fours'],
      [0.55, 'Thread one arm under, shoulder to the floor'],
    ],
    intent: { planted: ['feet', 'hands'] },
  },
};
const INTENT_W = {
  hands: { touching: 3, narrow: 11, shoulder: 20, wide: 32, wider: 44 },
  feet: { together: 6, hip: 11, wide: 20, wider: 32 },
  elbows: { straight: 0, back: 14, tucked: 18, flared: 42, out: 60 },
};
/* the 3D widths an exercise's description implies (explicit settings in the 3D table still win) */
function intentW3(id) {
  const i = DESC[id] && DESC[id].intent;
  if (!i) {
    return {};
  }
  const w = {};
  if (INTENT_W.hands[i.hands] != null) {
    w.hand = [INTENT_W.hands[i.hands], INTENT_W.hands[i.hands]];
  }
  if (INTENT_W.feet[i.feet] != null) {
    w.foot = [INTENT_W.feet[i.feet], INTENT_W.feet[i.feet]];
  }
  if (INTENT_W.elbows[i.elbows] != null) {
    w.flare = INTENT_W.elbows[i.elbows];
  }
  return w;
}

export { DESC, INTENT_W, intentW3 };
