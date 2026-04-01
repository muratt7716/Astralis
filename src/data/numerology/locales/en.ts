export type DeepMeaningProps = {
  title: string;
  general: string;
  jungianArchetype: string;
  shadowWork: string;
  neuroscience: string;
  career: string;
  love: string;
  advice: string;
};

export const pythagoreanMeanings: Record<number, DeepMeaningProps> = {
  1: {
    title: "Neural Pioneer and Cosmic Hero",
    general: "The number 1 represents the fire of existence, absolute will, and the first emergence from the unconscious to the conscious (Individuation). On a psychological level, you are a primal force declaring 'I am here'.",
    jungianArchetype: "The Hero & Solar Animus",
    shadowWork: "In your dark corridors (Shadow) lies repressed 'Narcissism' and 'Dictatorship'. Your shadow feeds on your fear of being weak.",
    neuroscience: "Your brain map operates entirely on a Dopamine (Ambition and Reward) focus. When it sees a goal, your Amygdala triggers the 'Fight' mode.",
    career: "Ventures where you can declare your reign, executive positions, or independent creations.",
    love: "You code your loved one as 'prey' or a 'kingdom' to be conquered. You desire partners who can maintain balance.",
    advice: "While celebrating personal victories, bring your arrogance under the control of your prefrontal cortex (logic)."
  },
  2: {
    title: "Spiritual Alchemist and Cosmic Anima",
    general: "The number 2 is the vibration of duality, yin-yang, and that feminine (receptive) principle in the unconscious. Your empathy is so clinically high that you confuse your boundaries.",
    jungianArchetype: "The Caregiver & Sacred Anima",
    shadowWork: "Your shadow is 'The Martyr' archetype. By constantly giving, there is a risk of making people emotionally obligated to you (manipulation).",
    neuroscience: "Mirror Neurons in your brain are extraordinarily active. You feel the pain of others in your body almost as a somatic (physical) reaction.",
    career: "Psychotherapy, diplomacy, holistic healing, and art.",
    love: "Love is a biological necessity; your oxytocin tank is your charging station. But boundless sacrifice paves the way for exploitation.",
    advice: "You must learn that saying no is not an act of violence, but a healthy boundary construction."
  },
  3: {
    title: "Divine Child and Cosmic Expression",
    general: "The frequency of creation and self-expression. Pure joy, humor, aesthetics, and creativity... Life is a giant playground for you to learn and experience.",
    jungianArchetype: "Divine Child & The Jester",
    shadowWork: "In your shadow self lies a neurotic 'Puer Aeternus' (Eternal Child) afraid of growing up. You have a tendency for superficiality (Toxic Positivity).",
    neuroscience: "Neurologically, there is a constant fireworks display (Dopamine burst) in your Frontal lobe; but it creates an extreme predisposition to Attention Deficit (ADHD).",
    career: "Design, communication, performing arts, advertising.",
    love: "You prefer experiencing over attaching. A monotonous relationship drives your nervous system to depression.",
    advice: "Masking every emotion tires the brain. Don't see sadness as a neurological poison; allowing your melancholy is your therapy."
  },
  4: {
    title: "Architect of the Unconscious and System Builder",
    general: "The vibration of 4 is the earthly name of form, system, order, and the rational mind. You are a mind afraid of chaos, programmed to create the cosmos (order).",
    jungianArchetype: "The Builder & The Ruler",
    shadowWork: "Your biggest shadow is your 'Strict Controller' and 'Obsessive' (OCD patterns) side. You must face the fear of the unknown.",
    neuroscience: "Your Prefrontal Cortex is the master of all other lobes in your brain. Chaos, however, causes your cortisol (Stress) to peak.",
    career: "Engineering, financial rationalism, legal infrastructures, giant architectures.",
    love: "Security heavily outweighs romance. You analyze trust like a risk analysis. You invest in loyalty.",
    advice: "Occasionally let go of control and surrender to the flexible waters of the unconscious. It creates new synaptic networks."
  },
  5: {
    title: "Curious Explorer and Chaos Alchemist",
    general: "The shaking, electric vibration of change 5. You have coded life not as a static lake, but as an exciting rollercoaster to be experienced with 5 senses.",
    jungianArchetype: "The Explorer & The Rebel",
    shadowWork: "Your shadow is 'The Hedonist' archetype. If you tend to cover that endless feeling of emptiness (void) with substances or adrenaline, you will collapse.",
    neuroscience: "Dopamine Receptors are incredibly hungry. When it sees a new stimulus, the Hippocampus enthusiastically sends signals.",
    career: "Traveling, freelance investor, risk analyst, journalism.",
    love: "You are in love with passion and new experiences rather than bonding in love. Staticity creates claustrophobia in you.",
    advice: "Learn to take a journey into yourself and your traumas as much as traveling the world."
  },
  6: {
    title: "Cosmic Healer and Absolute Guardian",
    general: "The vibration of responsibility, healing, family, and unconditional shelter. The world is your hearth. You are the eternal healer of the oppressed.",
    jungianArchetype: "The Guardian & The Lover",
    shadowWork: "Your shadow is 'The Guilt-Tripper' or 'Suffocating Manager'. You have a high risk of displaying narcissistic sacrifice (Codependency).",
    neuroscience: "Your neural networks are locked into a reward logic via the Oxytocin (Attachment) circuit.",
    career: "Psychological counseling, medicine, aesthetics sector or protective fields.",
    love: "Your relationship is a temple. You become not only the partner but the therapist of the person you fall in love with. You must draw boundaries.",
    advice: "You cannot heal the world's wound without healing your own."
  },
  7: {
    title: "Mysterious Senex of Deep Awakening",
    general: "The mysterious number 7 of occult consciousness and mental awakening. Your existence is about grasping behind the scenes, breaking the codes of the matrix.",
    jungianArchetype: "The Sage / Old Wise Man (Senex)",
    shadowWork: "Your shadow is 'The Paranoid Hermit'. It can weave walls of 'Intellectual Elitism' that looks down on others.",
    neuroscience: "The Default Mode Network (DMN) works tremendously in your brain. Your risk of over-analyzing (Ruminating) peaks.",
    career: "Psychoanalysis, theology, software/cryptography, occult sciences, forensics.",
    love: "You have zero tolerance for shallow relationships. You label deep souls with whom you can discuss psychoanalysis.",
    advice: "Sometimes step out from behind the microscope or books, just feel the wind, live without judging."
  },
  8: {
    title: "Power of Authority and Karmic Alchemist",
    general: "The manipulator of the material world and the strongest vibration embodying the reaction/karma of actions (cause-effect).",
    jungianArchetype: "The Ruler & The Magician",
    shadowWork: "Your shadow is 'The Tyrant' archetype. The risk of trampling values for power, and falling into success addiction (Workaholism).",
    neuroscience: "The Amygdala and Frontal Cortex work in sync to create a formidable 'Cold-Blooded Decision Mechanism'.",
    career: "Global entrepreneurship, CEO, politics, investment emperor.",
    love: "You are dominant in relationships; you wish to be in control or look for an equal power to challenge you (Power Couple).",
    advice: "Power, without love, is a destructive engine on its own. Don't let the walls of your material kingdom become a dungeon for your soul."
  },
  9: {
    title: "Universal Consciousness and Compassionate Light",
    general: "The finale of the cosmic journey, a high frequency containing pieces from all previous numbers, expressing a universal humanism beyond ego.",
    jungianArchetype: "The Innocent / The Savior & Mentor",
    shadowWork: "Your shadow is 'Emotional Non-Closure', 'Stuck in the Past' and a hidden 'Messiah Complex'.",
    neuroscience: "Your social brain is so developed that global pain (War, injustice) can create clinical PTSD or somatic pain in you.",
    career: "International fields, activism, universal art, healing leadership.",
    love: "Small, ego-based or jealous relationships damage your soul. You expect broad-hearted partners.",
    advice: "Learn to leave behind (Let Go) toxic relationships, memories, and jobs that have expired."
  },
  11: {
    title: "Master 11 - Celestial Conductor and Medium",
    general: "You are the earthly antenna of intuition and revelation. 11 is the Master number transferring the highest voltage information from the spiritual world to the physical universe.",
    jungianArchetype: "The Prophet / Visionary",
    shadowWork: "The 'Mad Genius' shadow fearing its own high voltage. The risk of anxiety and detachment from reality is high.",
    neuroscience: "There seems to be no filter mechanism between the prefrontal cortex and the Limbic system (Reduced Latent Inhibition).",
    career: "Innovative inventions, spiritual teaching, philosophical structures.",
    love: "You seek a Quantum Level (Karmic Mate) bond where your brain waves sync telepathically.",
    advice: "Keep your body (grounding) and nutrition very solid so that the electricity of the heavens doesn't fry your system."
  },
  22: {
    title: "Master 22 - Master Architect of Reality",
    general: "The 'Great Master Builder' turning dreams into physics, potential into universal reality.",
    jungianArchetype: "The Master Creator / Master Ruler",
    shadowWork: "The danger of using power to build dark/destructive manipulative systems. A spiral of mega-scale crises.",
    neuroscience: "The Left-Right hemispheres of your brain communicate with tremendous synchronization over the corpus callosum.",
    career: "Global scale leadership, giant organizations, philosophical architectures.",
    love: "Relationship signifies the most important 'partnership' (Power Alliance) supporting your mission.",
    advice: "Your dreams are so gigantic that if you set out without dividing them into pieces, you may drift into panic and depression."
  },
  33: {
    title: "Master 33 - Avatar of Universal Compassion",
    general: "The vibration of the Master Teacher. A consciousness carrying egoless love, unconditional healing, and wisdom.",
    jungianArchetype: "Messiah / Enlightened Healer",
    shadowWork: "Forgetting your own humanity and experiencing a boundless 'Savior Complex'.",
    neuroscience: "Mirror neurons have crossed boundaries. Empathy creates a total physical assimilation, not just emotional recognition.",
    career: "Universal spiritual leadership, enlightenment channel, visionary art.",
    love: "You have no business with the love of personal egos and minor flaws.",
    advice: "You are in a human form, you cannot bear the sins of the whole world without realizing this."
  },
  0: {
    title: "Undetermined Potential (0)",
    general: "Zero is the womb of all archetypal possibilities waiting potentially in the quantum field.",
    jungianArchetype: "Nothingness / Essence", shadowWork: "", neuroscience: "", career: "", love: "", advice: ""
  }
};

export const chaldeanMeanings: Record<number, { title: string, meaning: string }> = {
  10: { title: "Wheel of Fortune", meaning: "This is the wheel of fate. It whispers that your success can peak when supported by your own effort." },
  11: { title: "Hidden Danger", meaning: "It warns against the danger of hidden enemies, betrayals, and illusion." },
  12: { title: "The Sacrificed Man", meaning: "It is a warning that sacrifices and hardships may be endured, and good intentions might be exploited." },
  13: { title: "Rebirth", meaning: "Symbolizes destroying the old and building the new. Power is liquidated, signaling rising from the ashes." },
  14: { title: "Wind and Storm", meaning: "It is the number of financial ups and downs filled with intense work tempo and communication." },
  15: { title: "Mysterious Magician", meaning: "Symbolizes a great potential in occult and mystical subjects; an incredible magnetic pull (charisma)." },
  16: { title: "The Shattered Tower", meaning: "A karmic warning number. Be careful against unexpected falls. Arrogance can topple the towers." },
  17: { title: "Magic Star", meaning: "A highly auspicious vibration. Whispers a guarantee of success and leaving a mark." },
  18: { title: "Bleeding Moon", meaning: "Whispers family troubles, the psychology of loneliness, and betrayals from the surroundings; very skeptical." },
  19: { title: "Prince of Heaven", meaning: "The most sacred, brightest, most promising number of luck. Companion of success and great happiness." },
  20: { title: "Vibration of Awakening", meaning: "Herald of spiritual goals rather than the material world, and a massive philosophical dedication." },
  21: { title: "Crown of the World", meaning: "Ensures the grand goals where you'll wear the crown, an epic success taking a long time." },
  22: { title: "The Deceived Man", meaning: "The story of how your golden heart can face disappointment when entrusted to the wrong people." },
  23: { title: "The Lion's Star", meaning: "Strong luck and communication success; tells of a celestial hand that always protects you." },
  24: { title: "Heavenly Assistance", meaning: "A magnetism where you will progress rapidly by receiving great help from others (authorities etc.)." },
  25: { title: "Victory through Battle", meaning: "Success will come, but after passing through the fire of great difficulties and gaining experience." },
  26: { title: "Dark Storm", meaning: "A crisis vibration where you must be highly defensive against partnerships or legal processes." },
  27: { title: "Magic Scepter", meaning: "Offers a tremendous sharp intellect and original ideas. You will shine with your inspiring ability." },
  28: { title: "Shadows and Lawsuits", meaning: "Signifies that people may oppose you, pointing to legal or authoritative obstacles." },
  29: { title: "Tough Trials", meaning: "An intense karmic lesson advising you to be very protective against enemies disguised as friends." },
  30: { title: "Mental Hermit", meaning: "Your mind works very intensely, you are a genius but often suffer loneliness due to the probability of not being understood." },
  31: { title: "Silent Quest", meaning: "Reflects the desire to engage in philosophy and art in your shell instead of worldly ambitions." },
  32: { title: "Crown of Communication", meaning: "The leadership number of influencing crowds with the power of speech, rhetoric, and ideas." },
  33: { title: "Cosmic Healer", meaning: "A sea of deep compassion and magnetic emotion dedicated to humanity." },
  37: { title: "Magical Loyalty", meaning: "Heralds that your connections, friends, and business partners will bring you pure and great abundance." },
  42: { title: "Wheel of Sorrow", meaning: "An energy calling for caution and love, warning against the possibility of sudden breaks in romantic bonds." },
  0: { title: "Deep Resonance", meaning: "The bond your name forms with the universe is highly specific, holding secret vibrations within itself." }
};

export const personalYearMeanings: Record<number, { title: string, focus: string, action: string, warning: string }> = {
  1: {
    title: "Neurogenesis Startup: Year of Ignition",
    focus: "The first step of fate's 9-year cycle! A powerful period where the old is completely shattered and neuroplasticity starts from scratch.",
    action: "Gain independence (Autonomy)! Enter risky paths that will create new connections in your brain.",
    warning: "Returning to the past (old addictions, toxic exes) will anger you to the point of a nervous breakdown."
  },
  2: {
    title: "Emotional Synchronization (Incubation)",
    focus: "The seed waits silently beneath the soil. Limbic system is engaged; time for harmony, love, and partnership.",
    action: "Build oxytocin networks with diplomacy. Be open to dual alliances.",
    warning: "Haste (the feeling of 'Why isn't it happening now') collapses your entire connection balance with rising cortisol levels."
  },
  3: {
    title: "Creative Expression and Year of Light",
    focus: "Time to show yourself, communicate, and shine! The energy is blooming.",
    action: "Socialize, produce art, the universe expects you to step up to the showcase.",
    warning: "The risk of distraction is huge. Leaving projects unfinished and slipping into superficiality dissipates your potential energy."
  },
  4: {
    title: "Architecture of the Unconscious and Stability",
    focus: "Last year's holiday is over. Today is the year of laying foundations, diligence, and building security.",
    action: "Focus on your business, financial structure, or home layout; build your system.",
    warning: "Extreme strict rules can push you into a spiritual stuckness (anxiety), check your health."
  },
  5: {
    title: "Wind Direction and Sudden Change",
    focus: "Turning point! Changes, sudden job or location shifts are at the door. Universe injects you with risk.",
    action: "Take the wind at your back, make room for novelty and freedom.",
    warning: "Impulsive risks, gambling, or radical breakout decisions made without deep thought leave damage."
  },
  6: {
    title: "Cosmic Hearth and Web of Responsibility",
    focus: "A healing phase involving love, marriage, domestic dynamics, and family obligations (karma).",
    action: "Focus on your home and beloved closest circle. Be a healing visionary.",
    warning: "Don't strip yourself of all agency (Codependency) and assume the role of an absolute rescuer in your relationships."
  },
  7: {
    title: "Inward Turn: Spiritual Check-Up",
    focus: "Year of spirituality, belief, mysteries, and enlightenment rather than material matters. Slowing down in the outer world is felt.",
    action: "Analyze, focus on research, and spiritual discharge.",
    warning: "Isolating yourself completely from society and reality drifting into clinical isolation and paranoia."
  },
  8: {
    title: "Karmic Harvest: Authority and Power",
    focus: "Harvest time when the investments of the past 7 years will turn into cash (or power). Year of rising, becoming authority.",
    action: "Take charge. Play the leader in financial affairs and initiatives.",
    warning: "If ego (Arrogance) steps in, the sky tears apart the authority in your hand with the same speed."
  },
  9: {
    title: "Apoptosis: Cosmic Pruning (Ending)",
    focus: "The journey is ending. The closing phase of any toxic emotion or structure that no longer serves you in life.",
    action: "Forgive the past and initiate a massive 'Let go' routine.",
    warning: "Clinging to an old, dead structure with separation anxiety gives you severe psychological wounds."
  }
};

export const personalMonthMeanings: Record<number, string> = {
  1: "Month of individual initiative. An autonomous phase where you take action without waiting and plant new seeds.",
  2: "Month of cooperation and patience. Emotional empathy, diplomacy, bilateral communication are your focus in neuroscience.",
  3: "Time to step out. Artistic talents, communication, fun, and joy receptors are active. Spend your energy socializing.",
  4: "Month of discipline and building. Financial statements, paperwork, core responsibilities demand attention; postpone crazy ideas.",
  5: "Adventure, surprises, and winds of change. New opportunities may pop up suddenly; you must maximize flexibility.",
  6: "The heart of home, family, and healing energy. This month, romantic relationships and your private nest balance will be the universe's focal point.",
  7: "Cosmic Check-up: Rest your soul and listen to your deep intuitions. Your inner world makes more calling than material opportunities.",
  8: "Balance and Power Month: Time to expand serious jurisdictions where you can achieve financial and professional abundance via targeted steps.",
  9: "Purification Phase: Throw out past residues. The universe grants you a strong acid to clean up a job, feeling, or tie you say is over."
};

export const personalDayMeanings: Record<number, string> = {
  1: "Lead, do not delay. A very propellant cosmic power and dopamine release is behind you all day to take the first step.",
  2: "Avoid fights. Feel the oxytocin (harmony). You'll easily pass all exams of the day as long as you act diplomatically.",
  3: "Luck, joy, and communication flow are open. Your brain is in wonderful flexibility to negotiate, call friends, have fun.",
  4: "Although it looks very strict and tiring, the universe offers you an extraordinary focus capacity for organization, discipline, or cleaning.",
  5: "Stretch your boundaries. You are in an exciting and electric day where you can give radical reactions; embrace change.",
  6: "Focus on your loved ones, make a warm gesture. Your empathy is peaking; the universe wants you to radiate healing today.",
  7: "Look beyond the visible. You are in a mystical phase where your introverted and analytical intelligence is engaged.",
  8: "Make bold maneuvers! The sky's patronage is fully behind you to resolve a monetary situation or show authority.",
  9: "Forgive and apologize. Or get rid of the past. Every item you throw away or job you finish prepares your soul for tomorrow's 1 day."
};

/** ANALYSIS OF PASSIVE AND DOMINANT FREQUENCIES (ACTIVE/PASSIVE LOBES) */
export const frequencyExplanations = {
  active: {
    1: "Dominant Willpower: High ability to make your own decisions (Sun archetype). In extreme cases, prone to dictatorship or selfishness.",
    2: "Developed Intuitive Bond: You have tremendous empathy and partnership power. You feel people's frequencies in your body like a sponge.",
    3: "Dominant Social Expression: Cheerful, very talkative, and artistically talented (Frontal lobe activation). Sometimes hyperactive.",
    4: "Extreme Building/Discipline Power: You have a systematic, concrete, and practical nature. Sets strict rules occasionally.",
    5: "Sensory Adventure Receptor: Has a nervous system ultra-adapted to change and speed. Routine physically suffocates you.",
    6: "Hyper-Developed Protective Instinct: Protects family like a shield, takes their pain as your own wound. Seeks flawless order.",
    7: "Constant Analytical/Psychic Alertness: Your mind never silences. Highly diagnostic; an overly analytical genius.",
    8: "Dominant Control/Authority Center: Your amygdala is powerful at turning stress into action. Always open to managing finance and groups.",
    9: "Universal Activation: High sensitivity towards humanity, philosophy, global issues. Huge vision, but small details exhaust you."
  },
  passive: {
    1: "Confidence Blockage (Missing Will): Channels of independence/leadership are passive. You may await constant approval (dependent archetype).",
    2: "Empathy Blockage (Impatience Detection): Slow at sensing others' feelings (Mirror neurons) in binary relationships. Can give harsh reactions.",
    3: "Expression Eclipse (Throat Chakra/Creativity): Psychological blockage (social phobias) in self-expression. Hard to project joy.",
    4: "System and Focus Distraction: Hard to engage prefrontal capacity on issues requiring long-term focus (risk of foundation-less living).",
    5: "Loss of Adaptation and Flexibility: Sudden shifts in your life path may create shock (anxiety). You might be hesitant to step out of comfort.",
    6: "Rejection of Responsibility (Isolation): Missions of core bonding, taking responsibility, creating a hearth may feel suffocating.",
    7: "Fear of Remaining Superficial: Preferring to believe in outward physical reality rather than digging psychic depths; escaping loneliness.",
    8: "Material Timidity (Fear of Power/Money): You might carry beliefs blocking your sense of abundance. Fear in communicating with authority.",
    9: "Separation Anxiety (Denial of Endings): Hard to see the horizon of universal empathy. Suffers great pain/difficulty in letting go."
  }
};
