/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Topic, Article, Question, LearningPath, Resource, Comment } from './types';

export const INITIAL_TOPICS: Topic[] = [
  {
    slug: 'philosophy',
    name: 'Philosophy & Logic',
    nameAm: 'ፍልስፍና እና አመክንዮ',
    description: 'Classical arguments for God’s existence, objective morality, epistemology, and the nature of transcendent truth.',
    descriptionAm: 'ስለ እግዚአብሔር መኖር የሚቀርቡ ጥንታዊ ክርክሮች፣ ፍጹም ስነ-ምግባር፣ የእውቀት ፍልስፍና እና የላቀ እውነት ባህሪ።',
    articleCount: 2,
    icon: 'Compass',
  },
  {
    slug: 'suffering-and-evil',
    name: 'Suffering & Evil',
    nameAm: 'መከራ እና ክፋት',
    description: 'Intellectual and pastoral responses to the problem of pain, tragedy, natural disasters, and the goodness of God.',
    descriptionAm: 'ለስቃይ፣ ለጭንቀት፣ ለተፈጥሮ አደጋዎች እና ለእግዚአብሔር ቸርነት የሚቀርቡ አእምሯዊና እረኛዊ ምላሾች።',
    articleCount: 1,
    icon: 'ShieldAlert',
  },
  {
    slug: 'historical-jesus',
    name: 'The Historical Jesus',
    nameAm: 'ታሪካዊው ኢየሱስ',
    description: 'Investigating the reliability of the Gospels, historical evidence for the resurrection, and ancient testimonies.',
    descriptionAm: 'የወንጌላትን ተዓማኒነት፣ ለትንሣኤው የሚሆኑ ታሪካዊ ማስረጃዎችን እና ጥንታዊ ምስክርነቶችን መመርመር።',
    articleCount: 2,
    icon: 'BookOpen',
  },
  {
    slug: 'science-and-faith',
    name: 'Science & Creation',
    nameAm: 'ሳይንስ እና ፍጥረት',
    description: 'Cosmic fine-tuning, biological complexity, origins of life, and the profound harmony between modern science and theism.',
    descriptionAm: 'የኮስሚክ ስልታዊ ቅንጅት፣ ባዮሎጂካዊ ውስብስብነት፣ የህይወት አመጣጥ እና በዘመናዊ ሳይንስና በእምነት መካከል ያለው አስደናቂ ስምምነት።',
    articleCount: 1,
    icon: 'Atom',
  },
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'defending-the-resurrection',
    title: 'The Resurrection as Historical Fact',
    topicSlug: 'historical-jesus',
    difficulty: 'deep-dive',
    readingTime: 12,
    publishDate: '2026-06-15',
    excerpt: 'An forensic examination of the minimal historical facts surrounding the death, empty tomb, and sudden post-mortem appearances of Jesus of Nazareth.',
    coverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200',
    tags: ['resurrection', 'evidence', 'history', 'apologetics'],
    featured: true,
    isPublished: true,
    commentsAllowed: true,
    partInPath: {
      pathSlug: 'faith-and-reason',
      position: 4,
    },
    views: 1240,
    seoTitle: 'Is the Resurrection of Jesus Historical? | Hokhma Study',
    seoDescription: 'Explore the minimal facts argument defending the resurrection of Jesus Christ with historical and academic rigor.',
    footnotes: [
      { id: 1, text: "Habermas, Gary R. and Licona, Michael R. 'The Case for the Resurrection of Jesus', Kregel Publications, 2004." },
      { id: 2, text: "Wright, N.T., 'The Resurrection of the Son of God', Christian Origins and the Question of God series, Vol 3, Augsburg Fortress, 2003." },
      { id: 3, text: "Tacitus, 'Annals', Book XV, Chapter 44, detailing Tiberius’ reign and Christ’s execution under Pontius Pilate." }
    ],
    content: [
      {
        type: 'paragraph',
        text: 'Few questions in human history carry the philosophical and existential weight of the claim that Jesus of Nazareth rose physically from the dead. If true, it validates his radical divine authority and changes everything about how we perceive reality, life, and the grave. If false, Christianity is a tragic delusion.',
      },
      {
        type: 'header',
        text: 'The Minimal Facts Historical Method',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'In defending the resurrection, we do not begin by assuming the Bible is completely inspired or infallible. Instead, we use the "Minimal Facts" methodology pioneered by Dr. Gary Habermas. This approach only utilizes historical events that meet two strict criteria: first, they are solidly backed by diverse, early primary sources; second, nearly all modern biblical scholars—ranging from staunch secular atheists to conservative Christians—agree they occurred.',
      },
      {
        type: 'paragraph',
        text: 'We focus on four foundational pillars: Jesus died by crucifixion under Pontius Pilate, His disciples sincerely believed they saw Him alive again, the dramatic conversion of skeptics like James and Paul, and the mystery of the empty tomb.',
      },
      {
        type: 'scripture',
        text: 'And if Christ has not been raised, then our preaching is in vain and your faith is in vain. We are even found to be misrepresenting God, because we testified about God that he raised Christ, whom he did not raise if it is true that the dead are not raised.',
        reference: '1 Corinthians 15:14-15',
      },
      {
        type: 'header',
        text: '1. The Certainty of Jesus’ Death by Crucifixion',
        level: 3,
      },
      {
        type: 'paragraph',
        text: 'For a resurrection to occur, there must be an actual physical death. Scholars across the spectrum agree that the Roman crucifixion of Jesus is one of the most secure facts of ancient history. Secular Roman historians like Tacitus and Jewish historians like Josephus confirm this execution, leaving no room for "swoon" theories where Jesus survived.',
      },
      {
        type: 'header',
        text: '2. The Disciples’ Sincere Belief',
        level: 3,
      },
      {
        type: 'paragraph',
        text: 'Shortly after Jesus’ death, a small, terrified band of disciples underwent an immediate transformation into courageous martyrs. What changed them? They claimed to have witnessed physical appearances of the risen Christ. They did not fabricate a lie for personal power; they died agonizing deaths defending this belief, proving their absolute, unwavering sincerity.',
      },
      {
        type: 'header',
        text: 'The Ultimate Explanatory Power',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'When we compile these agreed-upon facts, naturalistic hypotheses (like mass hallucinations or conspiracy) cave under their own weight. Hallucinations do not happen to diverse groups in different locations simultaneously, nor do they consume a physical body from a heavily guarded tomb. The physical resurrection stands out as the explanation with the greatest historical integrity and explanatory scope.',
      }
    ],
  },
  {
    id: '2',
    slug: 'problem-of-pain',
    title: 'A Theological Defense in the Shadow of Suffering',
    topicSlug: 'suffering-and-evil',
    difficulty: 'intermediate',
    readingTime: 9,
    publishDate: '2026-06-12',
    excerpt: 'How can an all-powerful, all-loving God coexist with the stark presence of pain and moral catastrophe? Exploring the logical and pastoral dimensions.',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200',
    tags: ['suffering', 'theodicy', 'problem of evil', 'pain'],
    featured: false,
    isPublished: true,
    commentsAllowed: true,
    partInPath: {
      pathSlug: 'navigating-doubt',
      position: 2,
    },
    views: 890,
    seoTitle: 'Answering the Problem of Evil and Pain | Hokhma Study',
    seoDescription: 'A philosophical and theological approach to why a loving God allows suffering, pain, and free agency in a broken world.',
    footnotes: [
      { id: 1, text: "Lewis, C.S., 'The Problem of Pain', Macmillan, 1940." },
      { id: 2, text: "Plantinga, Alvin, 'The Nature of Necessity', Oxford University Press, 1974 (introducing the Free Will Defense)." }
    ],
    content: [
      {
        type: 'paragraph',
        text: 'The problem of evil is widely regarded as the most powerful objection to theistic belief. It is not merely an intellectual puzzle; it is a visceral, deeply emotional wound. When tragedy strikes, the silent question resonates: If God is perfectly loving, He would want to stop suffering; if He is all-powerful, He can stop suffering. Why does evil exist?',
      },
      {
        type: 'header',
        text: 'The Logical vs. Probabilistic Problem',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'Philosophers distinguish between the logical problem of evil (which claims God and suffering are mathematically incompatible) and the evidential or emotional problem. Thanks to Alvin Plantinga’s famous Free Will Defense, even secular philosophers acknowledge that God and evil are not logically contradictory.',
      },
      {
        type: 'scripture',
        text: 'He will wipe away every tear from their eyes, and death shall be no more, neither shall there be mourning, nor crying, nor pain anymore, for the former things have passed away.',
        reference: 'Revelation 21:4',
      },
      {
        type: 'paragraph',
        text: 'The core of the Free Will Defense is that it is of ultimate value to create a world where self-determining creatures can experience love, empathy, and genuine relationship. However, true free agency carries the inherent, unavoidable risk of rebellion, selfishness, and physical suffering. A world devoid of the possibility of pain would be a mechanical world stripped of authentic love.',
      },
      {
        type: 'header',
        text: 'The Cross: God Enters the Pain',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'What makes the Christian response to suffering unique among all other world religions is that our God is not an aloof bystander in the universe. On the cross, Jesus Christ entered into human suffering Himself, bearing the agony of betrayal, torture, and abandonment. We may not know the full reason why God permits specific tragedies, but we know what the reason is not: it is not that He does not care.',
      }
    ],
  },
  {
    id: '3',
    slug: 'cosmological-fine-tuning',
    title: 'Cosmic Fine-Tuning: The Witness of the Stars',
    topicSlug: 'science-and-faith',
    difficulty: 'beginner',
    readingTime: 7,
    publishDate: '2026-06-08',
    excerpt: 'An introduction to the anthropic coincidences and physical constants that make our universe remarkably hospitable to complex life.',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    tags: ['cosmology', 'fine-tuning', 'creation', 'science'],
    featured: false,
    isPublished: true,
    commentsAllowed: true,
    partInPath: {
      pathSlug: 'faith-and-reason',
      position: 1,
    },
    views: 1530,
    seoTitle: 'Cosmic Fine-Tuning & the existence of God | Hokhma Study',
    seoDescription: 'Learn about physical constants, gravity, and the cosmological constant that point towards intelligent design in our universe.',
    footnotes: [
      { id: 1, text: "Collins, Robin, 'The Well-Tempered Universe: God’s Fine-tuning and the Laws of Nature', 2003." },
      { id: 2, text: "Penrose, Roger, 'The Road to Reality', Vintage Books, 2005 (discussing low-entropy initial conditions)." }
    ],
    content: [
      {
        type: 'paragraph',
        text: 'In recent decades, cosmologists have discovered that our universe is balanced on a knife-edge. The fundamental mechanical laws and constant numbers of physics are dialed to an incomprehensibly precise level. If any of these values were shifted by even a hairline margin, stars, elements, and conscious life would never have formed.',
      },
      {
        type: 'header',
        text: 'The Precision of the Universal Constants',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'Take physical factors like gravity, the strong nuclear force, or the cosmological constant. If the gravitational constant were changed by only 1 part in 10 to the 60th power, the universe would have collapsed back in on itself, or expanded too quickly for planetary dust to coalesce. To illustrate: that is like trying to hit a one-inch target on the opposite side of the observable universe with a single arrow.',
      },
      {
        type: 'scripture',
        text: 'The heavens declare the glory of God, and the sky above proclaims his handiwork. Day to day pours out speech, and night to night reveals knowledge.',
        reference: 'Psalm 19:1-2',
      },
      {
        type: 'header',
        text: 'The Trilemma of Explanations',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'To explain this extreme level of precision, we have three options: physical necessity, luck, or design. No law of physics mandates these specific values—constants can be any value. Chance is statistically absurd. Therefore, the hypothesis of a conscious Designer who intended a living, thinking universe is by far the most logical and elegant explanation.',
      }
    ],
  },
  {
    id: '4',
    slug: 'the-moral-argument',
    title: 'Moral Realism and the Divine Anchor',
    topicSlug: 'philosophy',
    difficulty: 'intermediate',
    readingTime: 8,
    publishDate: '2026-06-05',
    excerpt: 'Why do we sense a binding obligation to objective justice and human dignity, and how does this anchor itself in the character of God?',
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200',
    tags: ['morality', 'philosophy', 'gods-existence', 'ethics'],
    featured: false,
    isPublished: true,
    commentsAllowed: true,
    partInPath: {
      pathSlug: 'faith-and-reason',
      position: 2,
    },
    views: 740,
    seoTitle: 'The Moral Argument for God | Hokhma Study',
    seoDescription: 'Why objective moral values require a transcendent source. A survey of the moral argument for Christian apologetics.',
    footnotes: [
      { id: 1, text: "Craig, William Lane, 'Reasonable Faith: Christian Truth and Apologetics', Crossway Books, 2008." },
      { id: 2, text: "Kant, Immanuel, 'Critique of Practical Reason', 1788 (grounding the moral necessity of the soul)." }
    ],
    content: [
      {
        type: 'paragraph',
        text: 'Almost everyone agrees that some acts are universally wrong. We believe that abusing children or torturing innocents is not merely a social taboo or a biochemical preference; it is an objective, universal evil. But if there is no higher moral standard beyond human opinion, what grounds this solid sense of objective morality?',
      },
      {
        type: 'header',
        text: 'The Syllogism of Value',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'The argument rests on a simple, elegant philosophical syllogism: If God does not exist, objective moral values and duties do not exist. Objective moral values and duties do exist. Therefore, God exists. This does not mean atheists cannot live incredibly ethical, loving lives; rather, it means they have no metaphysical anchor to justify why their actions are objective duties.',
      },
      {
        type: 'scripture',
        text: 'For when Gentiles, who do not have the law, by nature do what the law requires, they are a law to themselves, even though they do not have the law. They show that the work of the law is written on their hearts...',
        reference: 'Romans 2:14-15',
      },
      {
        type: 'paragraph',
        text: 'Under a purely materialistic view, humans are merely the accidental byproducts of socio-biological survival. Our moral feelings are no more "true" than the complex instincts of ants or wolves. Real moral duties, however, exert a binding presence that points to a transcendent Lawgiver whose very nature defines goodness and justice.',
      }
    ],
  },
  {
    id: '5',
    slug: 'reliability-of-gospels',
    title: 'The Textual Integrity of the New Testament',
    topicSlug: 'historical-jesus',
    difficulty: 'deep-dive',
    readingTime: 11,
    publishDate: '2026-05-28',
    excerpt: 'Exploring the massive textual evidence, early dating, and historical verification backing the text of the Christian Gospels.',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=1200',
    tags: ['gospels', 'manuscripts', 'reliability', 'history'],
    featured: false,
    isPublished: true,
    commentsAllowed: true,
    partInPath: {
      pathSlug: 'faith-and-reason',
      position: 3,
    },
    views: 1100,
    seoTitle: 'Are the Gospels Reliable Historical Accounts? | Hokhma Study',
    seoDescription: 'A thorough analysis of manuscript evidence, archaeological matches, and early eyewitness dating of the biblical Gospels.',
    footnotes: [
      { id: 1, text: "Bruce, F.F., 'The New Testament Documents: Are They Reliable?', Eerdmans Publishing, 1943." },
      { id: 2, text: "Blomberg, Craig L., 'The Historical Reliability of the Gospels', InterVarsity Press, 2007." }
    ],
    content: [
      {
        type: 'paragraph',
        text: 'A common skeptical soundbite is that the Gospels were written centuries after the facts by fabricated names, and have been altered so many times that the original message is lost. In reality, the textual and historical documentation backing the New Testament dwarfs that of any other ancient historical text.',
      },
      {
        type: 'header',
        text: 'The Manuscript Wealth',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'Classical ancient histories, such as those by Herodotus or Tacitus, survive on a handful of manuscripts, often dating 800 to 1,000 years after the events. In contrast, the New Testament has over 5,800 Greek manuscripts, some written within decades of the originals. This massive overlap allows textual scholars to reconstruct the original text with 99.5% accuracy.',
      },
      {
        type: 'scripture',
        text: 'For we did not follow cleverly devised myths when we made known to you the power and coming of our Lord Jesus Christ, but we were eyewitnesses of his majesty.',
        reference: '2 Peter 1:16',
      },
      {
        type: 'header',
        text: 'Archaeological Affirmations',
        level: 3,
      },
      {
        type: 'paragraph',
        text: 'Archaeology continuously corroborates the intricate historical settings mentioned in the Gospels: the Pool of Bethesda with its five porticoes, the skeletal crucified remains of Yohanan confirming Roman practices, and first-century census structures. The writers possessed intimate, native knowledge consistent only with first-century Palestinian eyewitness testimony.',
      }
    ],
  },
  {
    id: '6',
    slug: 'meaning-of-grace',
    title: 'Grace as an Aesthetic and Rational Necessity',
    topicSlug: 'philosophy',
    difficulty: 'beginner',
    readingTime: 6,
    publishDate: '2026-05-15',
    excerpt: 'An exploration of grace as the unique architectural beauty of Christianity, contrasting with the performance-driven models of our secular world.',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
    tags: ['grace', 'beauty', 'salvation', 'theology'],
    featured: false,
    isPublished: true,
    commentsAllowed: true,
    partInPath: {
      pathSlug: 'navigating-doubt',
      position: 3,
    },
    views: 620,
    seoTitle: 'Grace as a Rational and Beautiful Necessity | Hokhma Study',
    seoDescription: 'Why the concept of unconditional divine grace satisfies the human longing for significance, logic, and spiritual rest.',
    footnotes: [
      { id: 1, text: "Yancey, Philip, 'What’s So Amazing About Grace?', Zondervan, 1997." }
    ],
    content: [
      {
        type: 'paragraph',
        text: 'In almost every philosophy and religion, spirituality is structured around a ladder of merit. You earn your righteousness, your enlightenment, or your social approval by ascending steps of ethical performance. Christianity turns this structure completely upside down through the scandalous concept of grace.',
      },
      {
        type: 'header',
        text: 'The Ultimate Spiritual Reversal',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'Grace is unmerited, undeserved divine favor. It means we do not strive to reach God through moral achievement; rather, because we could never reach Him, God came down to reach us in our brokenness. It provides an immediate aesthetic cure to the performance anxiety that defines our modern achievement-oriented society.',
      },
      {
        type: 'scripture',
        text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.',
        reference: 'Ephesians 2:8-9',
      },
      {
        type: 'paragraph',
        text: 'This radical structure anchors our ultimate human value outside of ourselves. Because our identity is anchored in the perfect, unconditional love of Christ, we are liberated from both the pride of self-righteousness and the despair of ethical failure.',
      }
    ],
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'How can a loving God allow cancer, natural disasters, and absolute suffering in the world?',
    topicSlug: 'suffering-and-evil',
    difficulty: 'intermediate',
    tags: ['pain', 'theodicy', 'sovereignty'],
    articleSlug: 'problem-of-pain',
    articleTitle: 'A Theological Defense in the Shadow of Suffering',
    commonScore: 98,
    addedDate: '2026-06-18',
  },
  {
    id: 'q2',
    text: 'Did Jesus of Nazareth actually rise physical from the dead, or is it a mythical legend developed over time?',
    topicSlug: 'historical-jesus',
    difficulty: 'deep-dive',
    tags: ['evidence', 'history', 'resurrection'],
    articleSlug: 'defending-the-resurrection',
    articleTitle: 'The Resurrection as Historical Fact',
    commonScore: 95,
    addedDate: '2026-06-14',
  },
  {
    id: 'q3',
    text: 'Does astrophysics or cosmology disprove the Genesis Creator through theories like the Big Bang?',
    topicSlug: 'science-and-faith',
    difficulty: 'beginner',
    tags: ['universe', 'creation', 'astrophysics'],
    articleSlug: 'cosmological-fine-tuning',
    articleTitle: 'Cosmic Fine-Tuning: The Witness of the Stars',
    commonScore: 88,
    addedDate: '2026-06-05',
  },
  {
    id: 'q4',
    text: 'If there is no divine God, can we still maintain real, objective guidelines for moral values?',
    topicSlug: 'philosophy',
    difficulty: 'intermediate',
    tags: ['ethics', 'morality', 'secularism'],
    articleSlug: 'the-moral-argument',
    articleTitle: 'Moral Realism and the Divine Anchor',
    commonScore: 85,
    addedDate: '2026-06-01',
  },
  {
    id: 'q5',
    text: 'How do we know the Christian Gospels weren’t completely modified or rewritten over the centuries?',
    topicSlug: 'historical-jesus',
    difficulty: 'deep-dive',
    tags: ['manuscripts', 'integrity', 'gospels'],
    articleSlug: 'reliability-of-gospels',
    articleTitle: 'The Textual Integrity of the New Testament',
    commonScore: 90,
    addedDate: '2026-05-25',
  },
  {
    id: 'q6',
    text: 'What makes the Christian concept of salvation unique compared to other performance-based faiths?',
    topicSlug: 'philosophy',
    difficulty: 'beginner',
    tags: ['grace', 'salvation', 'identity'],
    articleSlug: 'meaning-of-grace',
    articleTitle: 'Grace as an Aesthetic and Rational Necessity',
    commonScore: 72,
    addedDate: '2026-05-12',
  }
];

export const INITIAL_PATHS: LearningPath[] = [
  {
    slug: 'faith-and-reason',
    title: 'Faith and Reason: A Foundations Guide',
    description: 'For seekers and believers alike, discover the solid philosophical, scientific, and historical backing for Christian classical theism.',
    goal: 'By the end of this path, you will be able to speak confidently about the cosmological argument, structural moral realism, manuscript reliability, and Christ’s physical resurrection.',
    articleCount: 4,
    difficultyRange: 'Beginner to Deep Dive',
    totalReadingTime: 38,
    articleSlugs: [
      'cosmological-fine-tuning',
      'the-moral-argument',
      'reliability-of-gospels',
      'defending-the-resurrection',
    ],
  },
  {
    slug: 'navigating-doubt',
    title: 'Walking Through Honest Intellectual Doubt',
    description: 'A compassionate, cerebral journey focusing on the primary emotional and philosophical hurdles to Christian belief, specifically suffering, guilt, and objective values.',
    goal: 'By the end of this path, you will navigate doubts surrounding the problem of pain, understand why objective morality requires an anchor, and find rest in the unconditional beauty of grace.',
    articleCount: 3,
    difficultyRange: 'Beginner to Intermediate',
    totalReadingTime: 23,
    articleSlugs: [
      'the-moral-argument',
      'problem-of-pain',
      'meaning-of-grace',
    ],
  },
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    category: 'Books',
    title: 'The Reason for God: Belief in an Age of Skepticism',
    author: 'Timothy Keller',
    description: 'A brilliant, elegant defense of Christian rationality addressing contemporary intellectual objections with cultural and philosophical grace.',
    link: 'https://www.goodreads.com/book/show/1110724.The_Reason_for_God',
  },
  {
    id: 'res-2',
    category: 'Books',
    title: 'The Resurrection of the Son of God',
    author: 'N.T. Wright',
    description: 'A monumental, scholarly, and comprehensive historical investigation of the ancient views of life after death and the historical facts of Jesus’ empty tomb.',
    link: 'https://www.goodreads.com/book/show/159424.The_Resurrection_of_the_Son_of_God',
  },
  {
    id: 'res-3',
    category: 'Books',
    title: 'Mere Christianity',
    author: 'C.S. Lewis',
    description: 'The golden standard of classical, common-sense Christian apologetics, unpacking morality, the trilemma of Christ, and the theology of faith.',
    link: 'https://www.goodreads.com/book/show/40792344-mere-christianity',
  },
  {
    id: 'res-4',
    category: 'Websites',
    title: 'Reasonable Faith with William Lane Craig',
    author: 'Dr. William Lane Craig',
    description: 'A premier academic and popular hub offering scholarly arguments, debate responses, articles, and podcasts covering Christian theism and the Gospels.',
    link: 'https://www.reasonablefaith.org',
  },
  {
    id: 'res-5',
    category: 'Podcasts',
    title: 'Unbelievable? with Justin Brierley',
    author: 'Justin Brierley / Premier Christian Radio',
    description: 'A highly respected show hosting charitable, in-depth dialogues between leading Christian thinkers and secular scholars addressing science, theology, and philosophy.',
    link: 'https://www.premierchristianradio.com/shows/unbelievable',
  },
  {
    id: 'res-6',
    category: 'Videos',
    title: 'InspiringPhilosophy YouTube Channel',
    author: 'Michael Jones',
    description: 'Deeply researched, visually spectacular animated videos detailing cosmology, quantum arguments, Old Testament contexts, and historical reliability.',
    link: 'https://www.youtube.com/user/InspiringPhilosophy',
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    articleSlug: 'defending-the-resurrection',
    authorName: 'Sarah Jenkins',
    text: 'This minimal facts breakdown is the cleanest outline I have read in months. It makes explaining these historical anchors to my college colleagues remarkably structured.',
    timestamp: '2026-06-16T14:32:00Z',
    isApproved: true,
  },
  {
    id: 'c2',
    articleSlug: 'problem-of-pain',
    authorName: 'Marcus Vance',
    text: 'C.S. Lewis’ quote that pain is God’s megaphone to rouse a deaf world has always intrigued me. This article does a wonderful job connecting that logic to the vulnerability of authentic human relationship.',
    timestamp: '2026-06-13T09:15:00Z',
    isApproved: true,
  },
  {
    id: 'c3',
    articleSlug: 'cosmological-fine-tuning',
    authorName: 'David K.',
    text: 'Does cosmic fine-tuning necessarily imply the Christian God rather than just some generic uncaused architect?',
    timestamp: '2026-06-19T22:45:00Z',
    isApproved: false, // For pending queue review!
  },
  {
    id: 'c4',
    articleSlug: 'defending-the-resurrection',
    authorName: 'Elizabeth S.',
    text: 'I used to think the resurrection was just a legend that crept in in the 3rd century. Seeing that the early creeds in 1 Corinthians date to within months of the event is highly destabilizing for skepticism.',
    timestamp: '2026-06-17T18:05:00Z',
    isApproved: false, // For pending queue review!
  },
  {
    id: 'c5',
    articleSlug: 'the-moral-argument',
    authorName: 'Jonathan Crane',
    text: 'If there are no absolute moral values without God, does that mean atheists don’t have code? Oh, wait, the article explicitly answered that. Clear writing, thank you.',
    timestamp: '2026-06-18T11:20:00Z',
    isApproved: false, // For pending queue review!
  }
];

export const STATEMENT_OF_FAITH = [
  {
    doctrine: 'The Godhead',
    belief: 'We believe in one eternal God who exists as a Trinity of three distinct persons: God the Father, God the Son (Jesus Christ), and God the Holy Spirit. Each is fully God, co-eternal, co-equal, and infinite in majesty, love, wisdom, and sovereign power.'
  },
  {
    doctrine: 'Sacred Scripture',
    belief: 'We believe the Bible (Old and New Testaments) is the inspired, authoritative, and reliable Word of God. It is our ultimate anchor for theological truth, moral instruction, and historical wisdom, pointing humanity ultimately to the saving life of Jesus.'
  },
  {
    doctrine: 'Creation & Humanity',
    belief: 'We believe God actively and intelligently designed the cosmos in supreme order. Humans are crafted in the image of God, possessing intrinsic moral agency, high creative value, and eternal purpose, though currently alienated from holy God by sin.'
  },
  {
    doctrine: 'Redemption & Grace',
    belief: 'We believe redemption is the sovereign gift of unconditional grace. Jesus Christ, being fully divine and fully human, lived a sinless life, died under Roman crucifixion to satisfy divine justice, and physically rose from the dead, unlocking spiritual justification for anyone who places faith in Him alone.'
  }
];

export const AUTHOR_BIO = {
  name: 'Rev. Dr. Thomas J. Sterling',
  role: 'Christian Apologist & Historical Scholar',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  bio: 'Rev. Dr. Thomas Sterling is an academic theologian, former classical philosopher, and pastor who has spent over two decades lecturing on the early historical context of the text of the New Testament, objective cosmic origins, and epistemological theism. Through Hokhma Study, he writes meticulously contextualized, elegant, and intellectually generous defenses of the faith for seekers and scholars alike.',
  email: 't.sterling@hokhma-study.org',
  tagline: 'Defending the reasonableness, depth, and beauty of Christ.',
  mission: 'To restore deep intellectual credibility and aesthetic warmth to Christian apologetics. We believe that hard questions deserve honest, historically sound, and philosophical answers that don’t bypass human doubt, but walk straight through it.'
};
