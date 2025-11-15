import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create personas
  const professionalPersona = await prisma.persona.upsert({
    where: { name: 'Professional' },
    update: {},
    create: {
      name: 'Professional',
      description: 'Formal, respectful, and business-like tone',
      tone: 'professional',
      modifiers: {
        formality: 'high',
        emotion: 'low',
        length: 'concise',
        vocabulary: 'formal'
      }
    }
  });

  const passionatePersona = await prisma.persona.upsert({
    where: { name: 'Passionate' },
    update: {},
    create: {
      name: 'Passionate',
      description: 'Emotional, urgent, and deeply concerned tone',
      tone: 'passionate',
      modifiers: {
        formality: 'medium',
        emotion: 'high',
        length: 'moderate',
        vocabulary: 'accessible'
      }
    }
  });

  const concernedPersona = await prisma.persona.upsert({
    where: { name: 'Concerned Citizen' },
    update: {},
    create: {
      name: 'Concerned Citizen',
      description: 'Thoughtful, reasonable, and community-focused tone',
      tone: 'concerned',
      modifiers: {
        formality: 'medium',
        emotion: 'moderate',
        length: 'moderate',
        vocabulary: 'accessible'
      }
    }
  });

  // Create issues
  const climateIssue = await prisma.issue.upsert({
    where: { name: 'Climate Action' },
    update: {},
    create: {
      name: 'Climate Action',
      description: 'Supporting policies to address climate change',
      category: 'Environment'
    }
  });

  const healthcareIssue = await prisma.issue.upsert({
    where: { name: 'Healthcare Access' },
    update: {},
    create: {
      name: 'Healthcare Access',
      description: 'Expanding access to affordable healthcare',
      category: 'Healthcare'
    }
  });

  const educationIssue = await prisma.issue.upsert({
    where: { name: 'Education Funding' },
    update: {},
    create: {
      name: 'Education Funding',
      description: 'Increasing funding for public education',
      category: 'Education'
    }
  });

  // Create representatives (sample data - using fake phone numbers for testing)
  const rep1 = await prisma.representative.upsert({
    where: { id: 'rep-1' },
    update: {},
    create: {
      id: 'rep-1',
      name: 'Jane Smith',
      title: 'Senator',
      state: 'CA',
      phoneNumber: '+15555550100', // Fake number for testing
      party: 'Democrat',
      email: 'senator.smith@senate.gov'
    }
  });

  const rep2 = await prisma.representative.upsert({
    where: { id: 'rep-2' },
    update: {},
    create: {
      id: 'rep-2',
      name: 'John Doe',
      title: 'Representative',
      state: 'CA',
      district: '12',
      phoneNumber: '+15555550101', // Fake number for testing
      party: 'Republican',
      email: 'rep.doe@house.gov'
    }
  });

  const rep3 = await prisma.representative.upsert({
    where: { id: 'rep-3' },
    update: {},
    create: {
      id: 'rep-3',
      name: 'Maria Garcia',
      title: 'Senator',
      state: 'NY',
      phoneNumber: '+15555550102', // Fake number for testing
      party: 'Democrat',
      email: 'senator.garcia@senate.gov'
    }
  });

  // Link representatives to issues
  await prisma.representativeIssue.upsert({
    where: {
      representativeId_issueId: {
        representativeId: rep1.id,
        issueId: climateIssue.id
      }
    },
    update: {},
    create: {
      representativeId: rep1.id,
      issueId: climateIssue.id
    }
  });

  await prisma.representativeIssue.upsert({
    where: {
      representativeId_issueId: {
        representativeId: rep1.id,
        issueId: healthcareIssue.id
      }
    },
    update: {},
    create: {
      representativeId: rep1.id,
      issueId: healthcareIssue.id
    }
  });

  await prisma.representativeIssue.upsert({
    where: {
      representativeId_issueId: {
        representativeId: rep2.id,
        issueId: educationIssue.id
      }
    },
    update: {},
    create: {
      representativeId: rep2.id,
      issueId: educationIssue.id
    }
  });

  await prisma.representativeIssue.upsert({
    where: {
      representativeId_issueId: {
        representativeId: rep3.id,
        issueId: climateIssue.id
      }
    },
    update: {},
    create: {
      representativeId: rep3.id,
      issueId: climateIssue.id
    }
  });

  // Create scripts
  await prisma.script.create({
    data: {
      issueId: climateIssue.id,
      title: 'Support Clean Energy Investment',
      description: 'Call for supporting renewable energy and reducing fossil fuel subsidies',
      content: `Hello, my name is [CALLER_NAME] and I'm a constituent from [LOCATION]. I'm calling to urge [REPRESENTATIVE_NAME] to support increased investment in clean energy and renewable resources. Climate change is an urgent threat to our community and our future. I ask that you vote in favor of legislation that promotes clean energy jobs and reduces our dependence on fossil fuels. Thank you for your time.`,
      menuSteps: [
        { waitFor: 'main menu', action: 'press 1' },
        { waitFor: 'leave message', action: 'press 2' }
      ]
    }
  });

  await prisma.script.create({
    data: {
      issueId: healthcareIssue.id,
      title: 'Support Medicare Expansion',
      description: 'Call for expanding Medicare coverage',
      content: `Hello, my name is [CALLER_NAME] and I'm calling from [LOCATION]. I want to express my strong support for expanding Medicare coverage. Many people in our community struggle to afford healthcare, and expanding Medicare would provide critical relief. I urge [REPRESENTATIVE_NAME] to support Medicare expansion legislation. Healthcare is a human right, and we need our representatives to act on this. Thank you.`,
      menuSteps: [
        { waitFor: 'main menu', action: 'press 1' }
      ]
    }
  });

  await prisma.script.create({
    data: {
      issueId: educationIssue.id,
      title: 'Increase Public School Funding',
      description: 'Call for increased federal funding for public schools',
      content: `Hello, my name is [CALLER_NAME] and I'm a constituent. I'm calling to ask [REPRESENTATIVE_NAME] to support increased federal funding for our public schools. Our teachers are underpaid, our classrooms are overcrowded, and our students deserve better. Investing in education is investing in our future. Please vote yes on bills that increase education funding. Thank you for listening.`,
      menuSteps: []
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
