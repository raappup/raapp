// Severity: -1 unknown, 0 none, 1 slight, 2 moderate, 3 severe
const RAapp = window.RAapp || {};
window.RAapp = RAapp;

RAapp.SEVERITY_LEVELS = [0, 1, 2, 3, -1];

RAapp.SEVERITY_LABELS = {
  '-1': '?',
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3'
};

RAapp.SEVERITY_NAMES = {
  '-1': 'Unknown',
  '0': 'None',
  '1': 'Slight',
  '2': 'Moderate',
  '3': 'Severe'
};

RAapp.defaultJointStatus = function() {
  return { swollen: 0, painful: 0 };
};

RAapp.JOINT_GROUPS = [
  {
    name: 'Left Hand',
    layout: 'grid',
    // Mirror: pinky → thumb (left to right, as if looking at palm-down left hand)
    columns: ['Pinky', 'Ring', 'Middle', 'Index', 'Thumb'],
    rows: [
      ['left_pinky_pip', 'left_ring_pip', 'left_middle_pip', 'left_index_pip', 'left_thumb_pip'],
      ['left_pinky_mcp', 'left_ring_mcp', 'left_middle_mcp', 'left_index_mcp', 'left_thumb_mcp'],
      [null,             null,            null,              null,             'left_thumb_cmc'],
    ],
    rowLabels: ['PIP', 'MCP', 'CMC'],
    joints: [
      { key: 'left_thumb_cmc', label: 'CMC' },
      { key: 'left_thumb_mcp', label: 'MCP' },
      { key: 'left_thumb_pip', label: 'PIP' },
      { key: 'left_index_mcp', label: 'MCP' },
      { key: 'left_index_pip', label: 'PIP' },
      { key: 'left_middle_mcp', label: 'MCP' },
      { key: 'left_middle_pip', label: 'PIP' },
      { key: 'left_ring_mcp', label: 'MCP' },
      { key: 'left_ring_pip', label: 'PIP' },
      { key: 'left_pinky_mcp', label: 'MCP' },
      { key: 'left_pinky_pip', label: 'PIP' },
    ]
  },
  {
    name: 'Right Hand',
    layout: 'grid',
    // Columns: thumb → pinky (left to right, as if looking at palm-down right hand)
    columns: ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'],
    // Rows: fingertip → palm (PIP on top, MCP middle, CMC bottom — only thumb has CMC)
    rows: [
      ['right_thumb_pip', 'right_index_pip', 'right_middle_pip', 'right_ring_pip', 'right_pinky_pip'],
      ['right_thumb_mcp', 'right_index_mcp', 'right_middle_mcp', 'right_ring_mcp', 'right_pinky_mcp'],
      ['right_thumb_cmc', null,              null,               null,             null],
    ],
    rowLabels: ['PIP', 'MCP', 'CMC'],
    joints: [
      { key: 'right_thumb_cmc', label: 'CMC' },
      { key: 'right_thumb_mcp', label: 'MCP' },
      { key: 'right_thumb_pip', label: 'PIP' },
      { key: 'right_index_mcp', label: 'MCP' },
      { key: 'right_index_pip', label: 'PIP' },
      { key: 'right_middle_mcp', label: 'MCP' },
      { key: 'right_middle_pip', label: 'PIP' },
      { key: 'right_ring_mcp', label: 'MCP' },
      { key: 'right_ring_pip', label: 'PIP' },
      { key: 'right_pinky_mcp', label: 'MCP' },
      { key: 'right_pinky_pip', label: 'PIP' },
    ]
  },
  {
    name: 'Left Foot',
    layout: 'grid',
    // Mirror: 5th → big (left to right, as if looking down at feet)
    columns: ['5th', '4th', '3rd', '2nd', 'Big'],
    rows: [
      ['left_5th_toe_pip', 'left_4th_toe_pip', 'left_3rd_toe_pip', 'left_2nd_toe_pip', 'left_big_toe_ip'],
      ['left_5th_toe_mtp', 'left_4th_toe_mtp', 'left_3rd_toe_mtp', 'left_2nd_toe_mtp', 'left_big_toe_mtp'],
    ],
    rowLabels: ['IP/PIP', 'MTP'],
    joints: [
      { key: 'left_big_toe_mtp', label: 'MTP' },
      { key: 'left_big_toe_ip', label: 'IP' },
      { key: 'left_2nd_toe_mtp', label: 'MTP' },
      { key: 'left_2nd_toe_pip', label: 'PIP' },
      { key: 'left_3rd_toe_mtp', label: 'MTP' },
      { key: 'left_3rd_toe_pip', label: 'PIP' },
      { key: 'left_4th_toe_mtp', label: 'MTP' },
      { key: 'left_4th_toe_pip', label: 'PIP' },
      { key: 'left_5th_toe_mtp', label: 'MTP' },
      { key: 'left_5th_toe_pip', label: 'PIP' },
    ]
  },
  {
    name: 'Right Foot',
    layout: 'grid',
    columns: ['Big', '2nd', '3rd', '4th', '5th'],
    rows: [
      ['right_big_toe_ip',  'right_2nd_toe_pip',  'right_3rd_toe_pip',  'right_4th_toe_pip',  'right_5th_toe_pip'],
      ['right_big_toe_mtp', 'right_2nd_toe_mtp', 'right_3rd_toe_mtp', 'right_4th_toe_mtp', 'right_5th_toe_mtp'],
    ],
    rowLabels: ['IP/PIP', 'MTP'],
    joints: [
      { key: 'right_big_toe_mtp', label: 'MTP' },
      { key: 'right_big_toe_ip', label: 'IP' },
      { key: 'right_2nd_toe_mtp', label: 'MTP' },
      { key: 'right_2nd_toe_pip', label: 'PIP' },
      { key: 'right_3rd_toe_mtp', label: 'MTP' },
      { key: 'right_3rd_toe_pip', label: 'PIP' },
      { key: 'right_4th_toe_mtp', label: 'MTP' },
      { key: 'right_4th_toe_pip', label: 'PIP' },
      { key: 'right_5th_toe_mtp', label: 'MTP' },
      { key: 'right_5th_toe_pip', label: 'PIP' },
    ]
  },
  {
    name: 'Large Joints',
    layout: 'paired',
    // Body order top-to-bottom, left/right pairs
    pairs: [
      { left: { key: 'left_shoulder', label: 'L Shoulder' }, right: { key: 'right_shoulder', label: 'R Shoulder' } },
      { left: { key: 'left_elbow', label: 'L Elbow' }, right: { key: 'right_elbow', label: 'R Elbow' } },
      { left: { key: 'left_wrist', label: 'L Wrist' }, right: { key: 'right_wrist', label: 'R Wrist' } },
      { left: { key: 'left_hip', label: 'L Hip' }, right: { key: 'right_hip', label: 'R Hip' } },
      { left: { key: 'left_knee', label: 'L Knee' }, right: { key: 'right_knee', label: 'R Knee' } },
      { left: { key: 'left_ankle', label: 'L Ankle' }, right: { key: 'right_ankle', label: 'R Ankle' } },
    ],
    joints: [
      { key: 'left_shoulder', label: 'L Shoulder' },
      { key: 'right_shoulder', label: 'R Shoulder' },
      { key: 'left_elbow', label: 'L Elbow' },
      { key: 'right_elbow', label: 'R Elbow' },
      { key: 'left_wrist', label: 'L Wrist' },
      { key: 'right_wrist', label: 'R Wrist' },
      { key: 'left_hip', label: 'L Hip' },
      { key: 'right_hip', label: 'R Hip' },
      { key: 'left_knee', label: 'L Knee' },
      { key: 'right_knee', label: 'R Knee' },
      { key: 'left_ankle', label: 'L Ankle' },
      { key: 'right_ankle', label: 'R Ankle' },
    ]
  }
];

RAapp.ALL_JOINTS = RAapp.JOINT_GROUPS.flatMap(g => g.joints);
RAapp.JOINT_KEYS = RAapp.ALL_JOINTS.map(j => j.key);
