-- MOMENTUM APP - CHALLENGE LIBRARY SEED DATA
-- 60 Validated Challenges (20 per zone × 3 difficulty levels)
-- Based on research: /docs/RESEARCH_challenge_design.md
--
-- Design Principles:
-- - Specificity (clear instructions, not vague)
-- - Implementation intentions ("If X, then Y" format)
-- - 5-15 minute time estimates
-- - SUDS-calibrated difficulty (10-30 novice, 30-60 intermediate, 60-80+ advanced)
-- - Identity-framing language
-- - Falsifiable success criteria

-- =============================================================================
-- SOCIAL ZONE (20 challenges)
-- =============================================================================

-- SOCIAL - DIFFICULTY 1 (Novice) - SUDS 10-30
INSERT INTO challenges (id, zone, difficulty, title, description, estimated_time, implementation_trigger, implementation_action, identity_frame, meaning_connection, evidence_type, is_active) VALUES
('social_01', 'social', 'low', 'Make Eye Contact with a Stranger', 'Hold eye contact with someone you don''t know for 2-3 seconds. Smile if it feels natural.', 5, 'When I''m in a public space (coffee shop, grocery store, sidewalk)', 'I will make eye contact with one person and hold it for 2-3 seconds', 'People who connect comfortably with others practice seeing and being seen', 'Eye contact is the foundation of human connection. You''re building the capacity to be present with others.', 'text', true),

('social_02', 'social', 'low', 'Ask a Stranger for a Recommendation', 'Approach someone and ask for a recommendation: a coffee shop, restaurant, or local spot they enjoy.', 5, 'When I''m in a new area or waiting in line', 'I will ask one stranger for a local recommendation', 'People who build connections initiate conversations, even brief ones', 'Asking for help creates connection. You''re proving you''re willing to reach out.', 'text', true),

('social_03', 'social', 'low', 'Compliment One Person Today', 'Give a genuine compliment to someone you don''t know well. Make it specific (not "nice shirt" but "that color looks great on you").', 5, 'When I notice something I genuinely appreciate about someone', 'I will tell them specifically what I noticed', 'People who spread positivity speak up when they notice good things', 'Compliments create micro-moments of connection. You''re practicing generosity.', 'text', true),

('social_04', 'social', 'low', 'Start a 2-Minute Conversation', 'Strike up a conversation with someone you don''t know. Ask about their day, a local place, or something they''re holding.', 8, 'When I''m in a waiting area, checkout line, or shared space', 'I will ask an open-ended question and listen for 2 minutes', 'People who are socially courageous initiate, even when it feels awkward', 'Small talk builds social muscle. You''re proving connection is worth the discomfort.', 'text', true),

('social_05', 'social', 'low', 'Introduce Yourself to a Neighbor', 'Knock on a neighbor''s door or catch them outside. Introduce yourself by name and mention you live nearby.', 10, 'When I see my neighbor outside or have 10 minutes', 'I will introduce myself and ask one question about them', 'People who build community take the first step to connect', 'Proximity doesn''t create connection—initiative does. You''re building local community.', 'text', true),

('social_06', 'social', 'low', 'Say Hello to 5 People Today', 'Greet 5 people you pass (elevator, hallway, sidewalk). Make eye contact and say "hello" or "good morning."', 10, 'When I pass someone within 6 feet', 'I will make eye contact, smile, and say hello', 'People who create warmth around them acknowledge others', 'Greetings normalize social contact. You''re proving you don''t avoid human interaction.', 'text', true),

('social_07', 'social', 'low', 'Text Someone You Haven''t Spoken to in 6 Months', 'Send a message to someone you''ve been meaning to reach out to. Be specific: "I was thinking about [specific memory]. Hope you''re doing well."', 10, 'When I think of someone I''ve lost touch with', 'I will send a specific, warm message mentioning a shared memory', 'People who maintain relationships reach out, even when time has passed', 'Reconnection takes courage. You''re valuing relationships over awkwardness.', 'text', true),

-- SOCIAL - DIFFICULTY 2 (Intermediate) - SUDS 30-60
('social_08', 'social', 'medium-low', 'Ask for Help or Feedback', 'Ask someone for genuine help or feedback on something you''re working on. Be specific: "I''d value your feedback on..."', 10, 'When I need input on something I''m working on', 'I will ask one person specifically what they think, then listen without defending', 'People who grow seek input and aren''t afraid to be seen as imperfect', 'Asking for feedback is vulnerability. You''re proving you value growth over appearing perfect.', 'text', true),

('social_09', 'social', 'medium-low', 'Join a Group Conversation Already in Progress', 'Approach 2+ people talking. Listen for 30 seconds, then add a comment or question related to their topic.', 10, 'When I see a group conversation at work, an event, or social gathering', 'I will approach, listen briefly, then contribute one relevant comment', 'People who belong in groups insert themselves, even when uninvited', 'Joining conversations builds social confidence. You''re proving you have a right to participate.', 'text', true),

('social_10', 'social', 'medium-low', 'Share a Personal Story in a Group', 'In a group setting (3+ people), share a brief personal story related to the conversation. Include a feeling or lesson.', 12, 'When the conversation touches on a topic I have experience with', 'I will share a 2-minute story that includes how I felt or what I learned', 'People who build depth share experiences, not just facts', 'Stories create connection. You''re showing you''re willing to be known.', 'text', true),

('social_11', 'social', 'medium-low', 'Invite Someone to Coffee or Lunch', 'Ask someone you don''t know well (acquaintance, coworker, neighbor) to grab coffee or lunch. Be direct: "Would you want to get coffee sometime?"', 10, 'When I feel a spark of connection with someone I don''t know well', 'I will extend a specific invitation within 24 hours', 'People who deepen relationships take the initiative to spend time together', 'Invitations risk rejection. You''re proving connection is worth the risk.', 'text', true),

('social_12', 'social', 'medium-low', 'Call Instead of Text', 'Call someone you would normally text. Have a 5-minute voice conversation instead of messaging back and forth.', 10, 'When I need to coordinate with someone or catch up', 'I will call them instead of texting', 'People who create real connection choose voice over text', 'Calls feel riskier than texts. You''re choosing richer connection.', 'text', true),

('social_13', 'social', 'medium-low', 'Speak Up in a Meeting or Group Discussion', 'Contribute one specific idea or thought in a meeting or group discussion. Don''t over-explain or apologize.', 8, 'When I have a thought during a meeting or group discussion', 'I will raise my hand or speak up with one clear sentence', 'People whose ideas matter speak up, even when nervous', 'Your voice has value. You''re proving your ideas deserve to be heard.', 'text', true),

('social_14', 'social', 'medium-low', 'Admit You Don''t Know Something', 'In a conversation or meeting, when you don''t know something, say "I don''t know" instead of faking it or staying silent.', 5, 'When someone asks me something I don''t know', 'I will say clearly "I don''t know" without apologizing excessively', 'People who are secure admit what they don''t know', 'Not knowing is human. You''re proving you don''t need to appear omniscient.', 'text', true),

-- SOCIAL - DIFFICULTY 3 (Advanced) - SUDS 60-80+
('social_15', 'social', 'medium', 'Share a Dissenting Opinion in a Group', 'State a genuine disagreement or unpopular opinion in a group setting. Don''t soften it or backtrack.', 15, 'When I have a different take on a topic being discussed', 'I will state my perspective clearly and calmly without apologizing', 'People who value truth over approval speak up, even when it risks rejection', 'Disagreement is social risk. You''re proving you can handle disapproval.', 'text', true),

('social_16', 'social', 'medium', 'Speak to a Group of 10+ People', 'Address a group of at least 10 people. It can be a toast, announcement, or brief presentation (2+ minutes).', 15, 'When I have an opportunity to address a group', 'I will speak for at least 2 minutes with clear eye contact', 'People who lead speak in front of groups, even when terrified', 'Public speaking is maximum social exposure. You''re proving you can be seen and heard.', 'text', true),

('social_17', 'social', 'medium', 'Have a Difficult Conversation You''ve Been Avoiding', 'Initiate a conversation you''ve been putting off. Name the issue directly within the first 2 minutes.', 20, 'When I''ve been avoiding a conversation for more than a week', 'I will schedule it within 24 hours and name the issue clearly', 'People who maintain healthy relationships address issues directly', 'Conflict avoidance erodes trust. You''re choosing honesty over comfort.', 'text', true),

('social_18', 'social', 'medium', 'Ask Someone on a Date', 'Ask someone you''re interested in on a date. Be clear it''s a date (not "hang out"—say "I''d like to take you on a date").', 10, 'When I feel attraction or interest in someone', 'I will ask them directly if they''d like to go on a date with me', 'People who pursue connection make their interest clear', 'Romantic risk is maximum vulnerability. You''re proving you can handle rejection.', 'text', true),

('social_19', 'social', 'medium', 'Share Something You''re Ashamed Of', 'In a 1-on-1 conversation with someone you trust, share something you feel shame about. Name it as shame.', 20, 'When I feel safe with someone and shame comes up', 'I will say "I feel ashamed about..." and share the story', 'People who heal bring their shame into the light', 'Shame thrives in secrecy. You''re proving you can be fully known.', 'text', true),

('social_20', 'social', 'medium', 'Apologize for Something You Did Wrong', 'Offer a specific apology for something you did that hurt someone. No excuses or justifications—just accountability.', 15, 'When I realize I hurt someone', 'I will say "I''m sorry for [specific action]. That was wrong." without defending myself', 'People who maintain integrity own their mistakes', 'Apologizing is ego death. You''re proving your relationships matter more than being right.', 'text', true);

-- =============================================================================
-- PHYSICAL ZONE (20 challenges)
-- =============================================================================

-- PHYSICAL - DIFFICULTY 1 (Novice) - SUDS 10-30
INSERT INTO challenges (id, zone, difficulty, title, description, estimated_time, implementation_trigger, implementation_action, identity_frame, meaning_connection, evidence_type, is_active) VALUES
('physical_01', 'physical', 'low', 'Take a Cold Shower (Last 30 Seconds)', 'End your shower with 30 seconds of cold water. Breathe through it without leaving early.', 5, 'When I''m in the shower', 'I will turn the water to cold for the last 30 seconds and stay present', 'People who honor their bodies don''t avoid discomfort—they lean into it', 'Cold exposure trains your nervous system. You''re building physical resilience.', 'text', true),

('physical_02', 'physical', 'low', 'Hold a Plank for 60 Seconds', 'Get into plank position and hold for 60 seconds. Focus on breathing, not on the discomfort.', 5, 'When I have 5 minutes', 'I will set a timer, hold a plank, and breathe steadily for 60 seconds', 'People who build strength do hard things when no one is watching', 'Physical challenge builds mental toughness. You''re proving you can endure.', 'text', true),

('physical_03', 'physical', 'low', 'Walk for 20 Minutes Without Stopping', 'Walk continuously for 20 minutes. No phone distractions—just walking and noticing your surroundings.', 20, 'When I finish work or need a break', 'I will walk for 20 minutes without my phone', 'People who care for their bodies move daily', 'Movement is medicine. You''re honoring your body by using it.', 'text', true),

('physical_04', 'physical', 'low', 'Do 20 Push-Ups (Modified OK)', 'Complete 20 push-ups. If full push-ups are too hard, do them on your knees. Focus on full range of motion.', 5, 'When I wake up or before bed', 'I will do 20 push-ups with good form', 'People who build physical capability do reps, not just intentions', 'Strength doesn''t come from motivation—it comes from reps. You''re building capacity.', 'text', true),

('physical_05', 'physical', 'low', 'Stand Instead of Sit for 1 Hour', 'Spend 1 hour standing instead of sitting. Work, read, or watch something while standing.', 60, 'When I would normally sit for an extended period', 'I will stand for 1 hour instead', 'People who take care of their bodies break sedentary patterns', 'Sitting is the new smoking. You''re choosing movement.', 'text', true),

('physical_06', 'physical', 'low', 'Stretch for 10 Minutes', 'Do a 10-minute full-body stretch. Focus on tight areas (hips, shoulders, hamstrings).', 10, 'When I wake up or before bed', 'I will stretch for 10 minutes, holding each position for 30 seconds', 'People who maintain flexibility care for their bodies proactively', 'Flexibility prevents injury. You''re investing in long-term mobility.', 'text', true),

('physical_07', 'physical', 'low', 'Drink 64 Ounces of Water Today', 'Drink at least 64 ounces (8 glasses) of water throughout the day. Track it.', 5, 'When I wake up', 'I will drink one glass immediately and track my water intake all day', 'People who respect their bodies hydrate consistently', 'Hydration affects everything. You''re choosing to fuel properly.', 'text', true),

-- PHYSICAL - DIFFICULTY 2 (Intermediate) - SUDS 30-60
('physical_08', 'physical', 'medium-low', 'Run for 15 Minutes Without Stopping', 'Run continuously for 15 minutes. Slow down if needed, but don''t walk. Focus on breathing rhythm.', 15, 'When I have 20 minutes available', 'I will run for 15 minutes without stopping, adjusting pace as needed', 'People who build endurance push through discomfort', 'Running teaches you that "I can''t" often means "I don''t want to." You''re proving you can.', 'text', true),

('physical_09', 'physical', 'medium-low', 'Do 100 Squats (Broken into Sets)', 'Complete 100 bodyweight squats. Break into sets if needed (e.g., 5 sets of 20).', 10, 'When I have 10 minutes', 'I will do 100 squats, resting as needed between sets', 'People who build strength accumulate reps over time', 'Volume builds muscle. You''re proving consistency matters more than intensity.', 'text', true),

('physical_10', 'physical', 'medium-low', 'Hold a Wall Sit for 2 Minutes', 'Sit against a wall with thighs parallel to the ground. Hold for 2 minutes without standing up.', 5, 'When I need a physical reset', 'I will hold a wall sit for 2 minutes, breathing through the burn', 'People who develop mental toughness stay present with physical discomfort', 'Wall sits teach endurance. You''re learning to sit with intensity.', 'text', true),

('physical_11', 'physical', 'medium-low', 'Take the Stairs for Every Opportunity Today', 'Every time you encounter stairs today, take them instead of the elevator or escalator. No exceptions.', 10, 'When I approach stairs or an elevator', 'I will choose the stairs every single time', 'People who honor their bodies choose movement over convenience', 'Small choices compound. You''re choosing vitality.', 'text', true),

('physical_12', 'physical', 'medium-low', 'Fast for 16 Hours', 'Complete a 16-hour fast (e.g., finish dinner at 7 PM, don''t eat until 11 AM). Stay hydrated.', 16, 'When I finish dinner', 'I will not eat again for 16 hours', 'People who have agency over their bodies can delay gratification', 'Fasting teaches discipline. You''re proving hunger doesn''t control you.', 'text', true),

('physical_13', 'physical', 'medium-low', 'Do a 30-Minute Workout', 'Complete a 30-minute workout. It can be bodyweight, running, cycling, or a class. No stopping early.', 30, 'When I have 30 minutes', 'I will work out continuously for 30 minutes without quitting', 'People who invest in their bodies prioritize movement', 'Thirty minutes is enough. You''re proving you can commit.', 'text', true),

('physical_14', 'physical', 'medium-low', 'Wake Up 30 Minutes Earlier Than Usual', 'Set your alarm 30 minutes earlier and get up immediately when it goes off. Use the time for movement or reflection.', 5, 'When my alarm goes off', 'I will get out of bed immediately and use the extra time intentionally', 'People who control their days wake up with purpose', 'Morning discipline sets the tone. You''re choosing agency.', 'text', true),

-- PHYSICAL - DIFFICULTY 3 (Advanced) - SUDS 60-80+
('physical_15', 'physical', 'medium', 'Do 50 Burpees Without Stopping', 'Complete 50 burpees in one session without significant rest (pausing in plank is OK). Push through the discomfort.', 10, 'When I need a hard physical reset', 'I will do 50 burpees and stay present with the intensity', 'People who build grit choose hard over easy', 'Burpees are miserable. You''re proving you can do miserable things.', 'text', true),

('physical_16', 'physical', 'medium', 'Run 3 Miles Without Walking', 'Run 3 miles continuously. Adjust pace as needed, but don''t walk. Focus on mental endurance.', 30, 'When I have 30-40 minutes', 'I will run 3 miles without stopping, no matter how slow', 'People who develop endurance don''t quit when it gets hard', 'Distance running is mental. You''re proving your mind is stronger than your legs.', 'text', true),

('physical_17', 'physical', 'medium', 'Do a 5-Minute Ice Bath', 'Sit in an ice bath (or very cold water) for 5 minutes. Breathe through it. Stay the full time.', 10, 'When I have access to a cold bath or shower', 'I will sit in ice-cold water for 5 minutes and practice calm breathing', 'People who master their nervous system stay calm in extreme discomfort', 'Ice baths teach surrender. You''re proving you can coexist with intensity.', 'text', true),

('physical_18', 'physical', 'medium', 'Complete a Full-Body HIIT Workout (40 Minutes)', 'Do a 40-minute high-intensity interval training workout. Push to 80-90% effort during intervals.', 40, 'When I have 45 minutes', 'I will complete a 40-minute HIIT session without skipping rounds', 'People who transform their bodies push beyond comfort', 'HIIT demands everything. You''re proving you can give it.', 'text', true),

('physical_19', 'physical', 'medium', 'Hold a Dead Hang for 90 Seconds', 'Hang from a pull-up bar for 90 seconds. If you drop, get back up and continue until you hit 90 total seconds.', 5, 'When I have access to a bar', 'I will hang for 90 cumulative seconds, getting back up if I drop', 'People who build grip strength don''t let go early', 'Grip endurance is mental. You''re proving you can hold on.', 'text', true),

('physical_20', 'physical', 'medium', 'Fast for 24 Hours', 'Complete a full 24-hour fast. Drink water and non-caloric beverages. Sit with hunger without fixing it.', 5, 'When I finish a meal', 'I will not eat for 24 hours', 'People who have mastery over their bodies can delay gratification', 'Hunger is information, not emergency. You''re proving you have control.', 'text', true);

-- =============================================================================
-- PROFESSIONAL ZONE (20 challenges)
-- =============================================================================

-- PROFESSIONAL - DIFFICULTY 1 (Novice) - SUDS 10-30
INSERT INTO challenges (id, zone, difficulty, title, description, estimated_time, implementation_trigger, implementation_action, identity_frame, meaning_connection, evidence_type, is_active) VALUES
('professional_01', 'professional', 'low', 'Send a Cold Email to Someone You Admire', 'Email someone you don''t know personally. Be specific about what you admire and ask one question.', 10, 'When I think of someone whose work I respect', 'I will send a short, specific email within 24 hours', 'People who build their careers reach out, even to strangers', 'Visibility requires risk. You''re proving you''re willing to reach out.', 'text', true),

('professional_02', 'professional', 'low', 'Speak Up in a Meeting', 'Contribute one idea or comment in a meeting. Don''t apologize before speaking.', 5, 'When I have a thought during a meeting', 'I will speak up clearly without prefacing with "this might be dumb but..."', 'People whose ideas matter speak up without apologizing', 'Your voice has value. You''re proving your ideas deserve space.', 'text', true),

('professional_03', 'professional', 'low', 'Ask for Clarification on Something You Don''t Understand', 'In a meeting or email, ask a clarifying question when something is unclear. Don''t pretend to understand.', 5, 'When I don''t understand something at work', 'I will ask a clear question: "Can you clarify what you mean by...?"', 'People who are secure admit what they don''t know', 'Clarity beats appearing smart. You''re choosing understanding over ego.', 'text', true),

('professional_04', 'professional', 'low', 'Share One Idea in Writing (Email or Slack)', 'Send an email or Slack message proposing an idea. It doesn''t have to be perfect—just clear.', 10, 'When I have an idea for improvement', 'I will write it out in 3-4 sentences and send it to my team or manager', 'People who contribute don''t wait for permission to share ideas', 'Ideas in your head create no value. You''re choosing contribution over perfection.', 'text', true),

('professional_05', 'professional', 'low', 'Compliment a Coworker Publicly', 'In a meeting, Slack channel, or email, give a coworker specific praise for something they did well.', 5, 'When I notice a coworker doing great work', 'I will acknowledge it publicly and specifically', 'People who build team culture celebrate others'' contributions', 'Public praise builds culture. You''re choosing generosity.', 'text', true),

('professional_06', 'professional', 'low', 'Update Your LinkedIn Profile', 'Add your most recent accomplishment to your LinkedIn. Be specific about what you did and the result.', 15, 'When I accomplish something at work', 'I will add it to LinkedIn within one week', 'People who advance their careers document their value publicly', 'Visibility creates opportunity. You''re proving your work matters.', 'text', true),

('professional_07', 'professional', 'low', 'Arrive 10 Minutes Early to a Meeting', 'Show up 10 minutes early to a meeting. Use the time to prepare or connect with others.', 10, 'When I have a meeting scheduled', 'I will arrive (or log in) 10 minutes early', 'People who are respected show up prepared and on time', 'Punctuality is professionalism. You''re choosing respect.', 'text', true),

-- PROFESSIONAL - DIFFICULTY 2 (Intermediate) - SUDS 30-60
('professional_08', 'professional', 'medium-low', 'Ask for Feedback on Your Work', 'Ask your manager or a trusted coworker for specific feedback on a recent project. Listen without defending.', 10, 'When I complete a project', 'I will ask "What could I have done better?" and listen without justifying', 'People who grow seek feedback, even when it''s uncomfortable', 'Feedback is growth. You''re proving you value improvement over comfort.', 'text', true),

('professional_09', 'professional', 'medium-low', 'Propose a New Process or Improvement', 'Write up a proposal for a process improvement at work. Include the problem, solution, and expected outcome.', 20, 'When I notice something inefficient', 'I will write a 1-page proposal and send it to the relevant person', 'People who lead identify problems and propose solutions', 'Complainers point out issues. Leaders solve them. You''re choosing leadership.', 'text', true),

('professional_10', 'professional', 'medium-low', 'Present in a Meeting (5+ Minutes)', 'Lead a portion of a meeting. Present an update, proposal, or idea for at least 5 minutes.', 15, 'When I have something to share in a meeting', 'I will volunteer to present it myself instead of having someone else deliver it', 'People who build visibility present their own work', 'Presenting is professional exposure. You''re proving you can be seen.', 'text', true),

('professional_11', 'professional', 'medium-low', 'Negotiate Something (Deadline, Scope, or Resource)', 'Push back on a deadline, scope, or resource ask. State what you need clearly and why.', 10, 'When I''m asked to do something unrealistic', 'I will say "I can do X, but I need Y to make it work"', 'People who protect their capacity set boundaries', 'Negotiation is self-respect. You''re proving your time and quality matter.', 'text', true),

('professional_12', 'professional', 'medium-low', 'Say No to a Request', 'Decline a request that doesn''t align with your priorities. Be direct and brief—no over-explaining.', 5, 'When someone asks me to do something I don''t have capacity for', 'I will say "I can''t take that on right now" without apologizing excessively', 'People who maintain focus say no to good things to preserve great things', 'Every yes is a no to something else. You''re choosing intentionality.', 'text', true),

('professional_13', 'professional', 'medium-low', 'Ask Your Manager for a 1-on-1', 'Request a 1-on-1 with your manager. Prepare 2-3 questions or topics in advance.', 10, 'When I need guidance or have something to discuss', 'I will send a meeting request with a brief agenda', 'People who manage up take ownership of their development', 'Your manager isn''t a mind reader. You''re proving you take initiative.', 'text', true),

('professional_14', 'professional', 'medium-low', 'Disagree with Your Manager (Professionally)', 'State a respectful disagreement with your manager''s decision or direction. Explain your reasoning clearly.', 10, 'When I think a decision is suboptimal', 'I will say "I see it differently" and explain my perspective calmly', 'People who add value challenge ideas, not people', 'Disagreement is contribution. You''re proving you care about outcomes.', 'text', true),

-- PROFESSIONAL - DIFFICULTY 3 (Advanced) - SUDS 60-80+
('professional_15', 'professional', 'medium', 'Ask for a Raise or Promotion', 'Request a raise or promotion. Prepare a case with specific accomplishments and market data.', 20, 'When I''ve been in my role for 12+ months and delivered strong results', 'I will schedule a meeting and present my case for advancement', 'People who are paid what they''re worth ask for it', 'Advocacy is uncomfortable. You''re proving you value yourself.', 'text', true),

('professional_16', 'professional', 'medium', 'Present to Leadership (Director+ Level)', 'Present to senior leadership (director level or higher). Prepare thoroughly and deliver confidently.', 30, 'When I have an opportunity to present to leadership', 'I will volunteer or accept the opportunity and prepare a clear, concise presentation', 'People who advance their careers get in front of decision-makers', 'Visibility at the top creates opportunity. You''re proving you belong in the room.', 'text', true),

('professional_17', 'professional', 'medium', 'Challenge a Widely-Held Assumption in Your Company', 'Question something "everyone agrees on." Write out your counterpoint and share it in a meeting or email.', 15, 'When I notice groupthink or an unexamined assumption', 'I will articulate a different perspective and share it clearly', 'People who drive change question the status quo', 'Innovation requires dissent. You''re proving you think independently.', 'text', true),

('professional_18', 'professional', 'medium', 'Lead a Project You''ve Never Led Before', 'Volunteer to lead a project outside your comfort zone. Own the outcomes, not just the tasks.', 60, 'When a new project opportunity arises', 'I will raise my hand to lead it, even if I''m not the most qualified', 'People who grow take on challenges before they''re ready', 'Leadership is learned by leading. You''re proving you''re willing to stretch.', 'text', true),

('professional_19', 'professional', 'medium', 'Have a Difficult Conversation with a Peer', 'Address a work issue directly with a colleague. Name the problem clearly and propose a path forward.', 15, 'When I have a recurring issue with a coworker', 'I will schedule time to discuss it directly and honestly', 'People who maintain healthy work relationships address conflict', 'Avoiding conflict erodes trust. You''re choosing honesty over comfort.', 'text', true),

('professional_20', 'professional', 'medium', 'Publish Your Work Publicly', 'Share something you created—a blog post, case study, or presentation—on LinkedIn or a public platform.', 30, 'When I create something valuable', 'I will publish it publicly for others to see and critique', 'People who build thought leadership put their work in the world', 'Public work invites judgment. You''re proving your work is worth sharing.', 'text', true);

-- =============================================================================
-- EMOTIONAL ZONE (20 challenges)
-- =============================================================================

-- EMOTIONAL - DIFFICULTY 1 (Novice) - SUDS 10-30
INSERT INTO challenges (id, zone, difficulty, title, description, estimated_time, implementation_trigger, implementation_action, identity_frame, meaning_connection, evidence_type, is_active) VALUES
('emotional_01', 'emotional', 'low', 'Name One Difficult Emotion Out Loud', 'When you feel a difficult emotion (frustration, anxiety, sadness), say it out loud: "I''m feeling [emotion]."', 5, 'When I notice I''m feeling something difficult', 'I will say out loud "I''m feeling [emotion]" and sit with it for 2 minutes', 'People who have emotional awareness name what they feel', 'Naming emotions reduces their power. You''re proving you can face them.', 'text', true),

('emotional_02', 'emotional', 'low', 'Write Down 3 Things You''re Grateful For', 'At the end of the day, write down 3 specific things you''re grateful for. Be concrete, not generic.', 5, 'Before bed', 'I will write down 3 specific things I appreciated today', 'People who maintain perspective practice gratitude daily', 'Gratitude rewires your brain. You''re training yourself to notice good.', 'text', true),

('emotional_03', 'emotional', 'low', 'Sit in Silence for 5 Minutes', 'Sit quietly for 5 minutes with no distractions. Just breathe. Notice your thoughts without engaging them.', 5, 'When I wake up or before bed', 'I will sit in silence for 5 minutes and simply breathe', 'People who have inner peace practice stillness', 'Silence is uncomfortable. You''re proving you can be with yourself.', 'text', true),

('emotional_04', 'emotional', 'low', 'Journal for 10 Minutes About Your Day', 'Write for 10 minutes about your day. Include what you felt, not just what you did.', 10, 'At the end of my day', 'I will write for 10 minutes about what I felt today', 'People who process emotions write about them', 'Journaling creates distance from intensity. You''re proving you can reflect.', 'text', true),

('emotional_05', 'emotional', 'low', 'Tell Someone "I''m Having a Hard Day"', 'When you''re struggling, tell someone directly: "I''m having a hard day." No need to explain why.', 5, 'When I''m struggling', 'I will tell one person "I''m having a hard day"', 'People who ask for support admit when they''re not okay', 'Vulnerability builds connection. You''re proving you don''t have to be strong alone.', 'text', true),

('emotional_06', 'emotional', 'low', 'Cry for 2 Minutes', 'Allow yourself to cry for at least 2 minutes. Don''t distract yourself or stop early. Let it out.', 5, 'When I feel sadness or grief', 'I will let myself cry for 2 minutes without stopping', 'People who process grief let themselves feel it', 'Tears are release. You''re proving emotions don''t break you.', 'text', true),

('emotional_07', 'emotional', 'low', 'Say "I''m Scared" Out Loud', 'When you feel fear, say out loud: "I''m scared of [specific thing]." Name the fear specifically.', 5, 'When fear comes up', 'I will name it out loud: "I''m scared of..."', 'People who face fear name it first', 'Fear loses power when spoken. You''re proving you can face it.', 'text', true),

-- EMOTIONAL - DIFFICULTY 2 (Intermediate) - SUDS 30-60
('emotional_08', 'emotional', 'medium-low', 'Share a Fear with Someone You Trust', 'Tell someone you trust about something you''re genuinely afraid of. Be specific.', 10, 'When I''m with someone I feel safe with', 'I will share a specific fear I have', 'People who build intimacy share what scares them', 'Shared fear is halved. You''re proving you can be known.', 'text', true),

('emotional_09', 'emotional', 'medium-low', 'Apologize for Something You Did Wrong', 'Apologize to someone you hurt. Be specific about what you did wrong. No "but" or justifications.', 10, 'When I realize I hurt someone', 'I will say "I''m sorry for [specific action]. That was wrong." without defending myself', 'People who maintain integrity own their mistakes', 'Apologizing is ego death. You''re proving relationships matter more than being right.', 'text', true),

('emotional_10', 'emotional', 'medium-low', 'Tell Someone How They Hurt You', 'Tell someone how their actions impacted you. Use "I felt..." language, not blame.', 15, 'When someone hurts me', 'I will say "When you [action], I felt [emotion]" within 48 hours', 'People who maintain boundaries name when they''ve been hurt', 'Unspoken pain erodes relationships. You''re choosing honesty.', 'text', true),

('emotional_11', 'emotional', 'medium-low', 'Write a Letter to Someone (Don''t Send It)', 'Write a letter to someone you have unresolved feelings about. Say everything you need to say. Keep it private.', 20, 'When I have unresolved feelings toward someone', 'I will write a full, uncensored letter expressing everything I feel', 'People who process emotions give them expression', 'Unsent letters create closure. You''re proving you can release what you carry.', 'text', true),

('emotional_12', 'emotional', 'medium-low', 'Forgive Someone (Even If They Haven''t Apologized)', 'Choose to forgive someone who hurt you. You don''t have to tell them—just release the resentment internally.', 15, 'When I''m holding resentment', 'I will say out loud or write down "I forgive [person] for [action]"', 'People who free themselves forgive, even without apologies', 'Forgiveness is for you, not them. You''re choosing freedom over bitterness.', 'text', true),

('emotional_13', 'emotional', 'medium-low', 'Sit with Anxiety Without Fixing It', 'When you feel anxious, sit with it for 10 minutes. Don''t distract, solve, or numb it. Just be with it.', 10, 'When anxiety shows up', 'I will sit quietly and breathe with the anxiety for 10 minutes', 'People who master their nervous system sit with discomfort', 'Anxiety isn''t an emergency. You''re proving you can coexist with it.', 'text', true),

('emotional_14', 'emotional', 'medium-low', 'Tell Someone You Love Them', 'Tell someone you love them. Be direct: "I love you." No qualifiers or disclaimers.', 5, 'When I feel love for someone', 'I will say "I love you" clearly and directly', 'People who build deep relationships name their love', 'Love expressed builds bonds. You''re proving you can be vulnerable.', 'text', true),

-- EMOTIONAL - DIFFICULTY 3 (Advanced) - SUDS 60-80+
('emotional_15', 'emotional', 'medium', 'Share Something You''re Ashamed Of', 'Tell someone you trust about something you feel shame about. Name it as shame: "I feel ashamed about..."', 20, 'When I feel safe with someone and shame comes up', 'I will say "I feel ashamed about..." and share the story', 'People who heal bring their shame into the light', 'Shame thrives in secrecy. You''re proving you can be fully known.', 'text', true),

('emotional_16', 'emotional', 'medium', 'Grieve a Loss You''ve Been Avoiding', 'Set aside 30 minutes to grieve something you''ve been avoiding (a death, breakup, or loss). Cry, write, or speak about it.', 30, 'When I have 30 minutes alone', 'I will let myself fully feel the grief I''ve been avoiding', 'People who heal grieve what they''ve lost', 'Unprocessed grief lives in your body. You''re proving you can face it.', 'text', true),

('emotional_17', 'emotional', 'medium', 'Tell Someone You''re Angry at Them', 'Express anger directly to someone. Use "I feel angry because..." without yelling or attacking.', 15, 'When I''m angry at someone', 'I will say "I feel angry because [specific reason]" within 48 hours', 'People who maintain relationships express anger directly', 'Suppressed anger becomes resentment. You''re choosing honesty.', 'text', true),

('emotional_18', 'emotional', 'medium', 'Ask for What You Need Emotionally', 'Tell someone what you need from them emotionally. Be specific: "I need you to listen without trying to fix this."', 10, 'When I need emotional support', 'I will ask clearly for what I need', 'People who get their needs met ask for what they need', 'No one can read your mind. You''re proving you can advocate for yourself.', 'text', true),

('emotional_19', 'emotional', 'medium', 'Tell Someone You''re Jealous', 'Admit jealousy to the person you''re jealous of. Name what you admire and wish you had.', 10, 'When I feel jealousy', 'I will say "I feel jealous of [specific thing] because I wish I had that"', 'People who are secure admit jealousy without shame', 'Jealousy reveals what you value. You''re proving you can be honest about it.', 'text', true),

('emotional_20', 'emotional', 'medium', 'End a Relationship That''s Unhealthy', 'Have the conversation you''ve been avoiding. End a relationship that drains you or violates your boundaries.', 30, 'When I know a relationship needs to end', 'I will initiate the conversation within one week', 'People who protect their peace let go of what harms them', 'Ending relationships is grief and relief. You''re proving you can choose yourself.', 'text', true);

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================

-- Verify all challenges were inserted correctly
SELECT
  zone,
  difficulty,
  COUNT(*) as challenge_count
FROM challenges
WHERE is_active = true
GROUP BY zone, difficulty
ORDER BY zone, difficulty;

-- Expected output:
-- social | low         | 7
-- social | medium-low  | 7
-- social | medium      | 6
-- physical | low       | 7
-- physical | medium-low| 7
-- physical | medium    | 6
-- professional | low   | 7
-- professional | medium-low | 7
-- professional | medium | 6
-- emotional | low      | 7
-- emotional | medium-low | 7
-- emotional | medium   | 6
-- TOTAL: 80 challenges (20 per zone × varied difficulties)
