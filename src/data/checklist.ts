import { InspectionModule } from '../types';

export const CHECKLIST_TEMPLATE: InspectionModule[] = [
  {
    id: 'A',
    title: 'Personal Protective Equipment (PPE) Compliance',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.1.2 (Hierarchy of Controls), OSHA 29 CFR 1910.132',
    items: [
      {
        id: 'A.1',
        ref: 'A.1',
        item: 'High-Visibility Vests',
        criteria: 'All staff on airside or construction zones are wearing Class 2/3 high-visibility vests with reflective strips intact.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'A.2',
        ref: 'A.2',
        item: 'Safety Footwear',
        criteria: 'Steel-toed or composite safety boots worn in baggage handling and maintenance areas; soles in good condition (anti-slip).',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'A.3',
        ref: 'A.3',
        item: 'Head & Eye Protection',
        criteria: 'Hard hats worn where overhead hazards exist; safety goggles/shields used during grinding, cutting, or chemical handling.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'A.4',
        ref: 'A.4',
        item: 'Hearing Protection',
        criteria: 'Ear muffs or plugs used in high-noise zones (Apron, Plant Rooms) where levels exceed 85dB.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'B',
    title: 'Work at Height & Access Equipment',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.1.1 (Operational Control), OSHA 1910.28',
    items: [
      {
        id: 'B.1',
        ref: 'B.1',
        item: 'Ladder Condition & Security',
        criteria: 'Ladders are free of damage, rungs secure, non-slip feet present. Step-ladders fully opened and locked.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'B.2',
        ref: 'B.2',
        item: 'Fall Arrest Equipment',
        criteria: 'Harnesses and lanyards inspected (in-date), zero fraying, shock absorbers intact. Anchor points verified.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'B.3',
        ref: 'B.3',
        item: 'Scaffold Integrity',
        criteria: 'Scaffolding has valid "Green Tag"; base plates stable, handrails/toe-boards in place, no missing planks.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'B.4',
        ref: 'B.4',
        item: 'MEWP Operations',
        criteria: 'Mobile Elevated Work Platforms operated by certified staff; exclusion zone cordoned off below.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'C',
    title: 'Electrical Safety & Energy Control',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.1.3 (Management of Change), NFPA 70E',
    items: [
      {
        id: 'C.1',
        ref: 'C.1',
        item: 'LOTO (Lockout-Tagout)',
        criteria: 'Maintenance work on energized systems has active padlocks and "DANGER - DO NOT OPERATE" tags applied.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'C.2',
        ref: 'C.2',
        item: 'Portable Tool Inspection (PAT)',
        criteria: 'All electric hand tools have current PAT test stickers; cords free of tape repairs or exposed wires.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'C.3',
        ref: 'C.3',
        item: 'Panel Access & Clearances',
        criteria: 'Electrical rooms locked; panels closed; 1m clear working space maintained in front of all switchgear.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'C.4',
        ref: 'C.4',
        item: 'Temporary Power/Cabling',
        criteria: 'Trailing cables are cable-managed or covered with ramps; zero "daisy-chaining" of multi-plugs.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'D',
    title: 'Hazardous Materials & Chemical Safety',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.1.2 (Hazard Elimination), GHS Compliance',
    items: [
      {
        id: 'D.1',
        ref: 'D.1',
        item: 'MSDS Availability',
        criteria: 'Material Safety Data Sheets (MSDS/SDS) available at point of use for all chemicals (cleaning, fuel, paints).',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'D.2',
        ref: 'D.2',
        item: 'Secondary Containment (Bunding)',
        criteria: 'Liquid chemicals stored on spill pallets; bunding volume ≥ 110% of largest container.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'D.3',
        ref: 'D.3',
        item: 'Labeling & Storage',
        criteria: 'All containers clearly labeled with GHS pictograms; incompatible chemicals (e.g., acids/bases) segregated.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'D.4',
        ref: 'D.4',
        item: 'Spill Kit Readiness',
        criteria: 'Spill kits present, stocked with absorbent pads/socks, and accessible in refueling or chemical storage areas.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'E',
    title: 'Housekeeping, Slips, Trips & Falls',
    statutoryRefs: 'ISO 45001:2018 Cl. 6.1.2.1 (Hazard Identification)',
    items: [
      {
        id: 'E.1',
        ref: 'E.1',
        item: 'Floor Surface Condition',
        criteria: 'Floors dry, free of oil spills or leaks; no loose tiles, frayed carpets, or uneven transition strips.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'E.2',
        ref: 'E.2',
        item: 'Aisle & Walkway Clearance',
        criteria: 'Pedestrian walkways and emergency paths 100% clear of waste, pallets, and equipment.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'E.3',
        ref: 'E.3',
        item: 'Waste Management',
        criteria: 'Waste bins not overflowing; hazardous waste (oily rags, batteries) stored in designated red bins.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'E.4',
        ref: 'E.4',
        item: 'Storage Stability',
        criteria: 'Racking secured to floor; items stacked neatly with heaviest at bottom; no "leaning" stacks.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'F',
    title: 'Fire Safety & Emergency Preparedness',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.2 (Emergency Preparedness), SBC 801',
    items: [
      {
        id: 'F.1',
        ref: 'F.1',
        item: 'Fire Extinguisher Readiness',
        criteria: 'Extinguishers present, charged (green zone), pin/seal intact, and inspection tag current.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'F.2',
        ref: 'F.2',
        item: 'Fire Exits & Signage',
        criteria: 'All fire exit doors functional (not blocked or locked); illuminated exit signs energized and visible.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'F.3',
        ref: 'F.3',
        item: 'Detection & Alarm System',
        criteria: 'Fire alarm panel "Normal"; smoke detectors clear of obstructions; manual call points accessible.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'F.4',
        ref: 'F.4',
        item: 'First Aid Kit Inventory',
        criteria: 'First aid kits accessible, marked, and stocked with in-date supplies. Eye-wash stations functional.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'G',
    title: 'Machinery & Equipment Guarding',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.1.1 (Maintenance of Controls)',
    items: [
      {
        id: 'G.1',
        ref: 'G.1',
        item: 'Fixed Guarding',
        criteria: 'Rotating parts, belts, and pulleys on HVAC units or conveyors are fully enclosed by fixed guards.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'G.2',
        ref: 'G.2',
        item: 'Emergency Stops (E-Stops)',
        criteria: 'E-stop buttons/pull-cords on BHS conveyors and workshop machinery are red, mushroom-headed, and functional.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'G.3',
        ref: 'G.3',
        item: 'Daily Pre-Use Checks',
        criteria: 'Forklifts, tugs, and tractors have completed daily logbooks/checklists before operation.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'H',
    title: 'Airside Operational Safety',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.1.4.2 (Contractors / Outsourcing)',
    items: [
      {
        id: 'H.1',
        ref: 'H.1',
        item: 'FOD (Foreign Object Debris)',
        criteria: 'Apron and taxiways free of loose nuts, bolts, plastic, or debris that could cause engine ingestion.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'H.2',
        ref: 'H.2',
        item: 'Vehicle Speed & Movement',
        criteria: 'Ground equipment observing speed limits; flashing beacons active; no parking in "No Parking" red zones.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'H.3',
        ref: 'H.3',
        item: 'Aircraft Refueling Safety',
        criteria: 'Bonding cables used; fire extinguishers staged; "No Smoking" signage strictly enforced during fueling.',
        status: null,
        severity: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  }
];
