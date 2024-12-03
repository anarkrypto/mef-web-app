import logger from '@/logging';
import { PrismaClient, User } from '@prisma/client'
import dotenv from "dotenv";
import path from "path";
import readline from 'readline';

const prisma = new PrismaClient()

// Try to load .env file, but don't fail if it doesn't exist
try {
  const envPath = path.resolve(process.cwd(), ".env");
  dotenv.config({ path: envPath });
} catch (error) {
  logger.warn("\x1b[33mNo .env file found, using environment variables\x1b[0m");
}

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function checkAdminStatus(userId: string): Promise<boolean> {
  const adminUser = await prisma.adminUser.findUnique({
    where: {
      userId: userId
    }
  });
  return !!adminUser;
}

async function setAdminStatus(userId: string, status: boolean): Promise<void> {
  if (status) {
    await prisma.adminUser.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });
    logger.debug(`${colors.green}✓${colors.reset} Admin status ${colors.bright}enabled${colors.reset}`);
  } else {
    await prisma.adminUser.delete({
      where: { userId }
    }).catch(() => {
      // Ignore if already not an admin
    });
    logger.debug(`${colors.yellow}✓${colors.reset} Admin status ${colors.bright}disabled${colors.reset}`);
  }
}

async function displayUserInfo(user: User, isAdmin: boolean) {
  const metadata = user.metadata as { username: string };
  
  logger.debug('\n📋 User Information:');
  logger.debug('══════════════════');
  logger.debug(`🆔 ID: ${colors.cyan}${user.id}${colors.reset}`);
  logger.debug(`👤 Username: ${colors.cyan}${metadata.username}${colors.reset}`);
  logger.debug(`👑 Admin Status: ${isAdmin 
    ? `${colors.green}✓ Enabled${colors.reset}` 
    : `${colors.red}✗ Disabled${colors.reset}`}`);
  logger.debug('──────────────────');
}

async function promptForAction(): Promise<'toggle' | 'enable' | 'disable' | 'exit'> {
  logger.debug('\n📝 Available actions:');
  logger.debug(`${colors.bright}1${colors.reset}) Toggle admin status`);
  logger.debug(`${colors.bright}2${colors.reset}) Enable admin status`);
  logger.debug(`${colors.bright}3${colors.reset}) Disable admin status`);
  logger.debug(`${colors.bright}4${colors.reset}) Exit`);
  
  const answer = await question('\nChoose an action (1-4): ');
  
  switch (answer.trim()) {
    case '1': return 'toggle';
    case '2': return 'enable';
    case '3': return 'disable';
    case '4': return 'exit';
    default: return promptForAction();
  }
}

async function main() {
  try {
    // Get userId from args or prompt
    let userId = process.argv[2];
    
    if (!userId) {
      userId = await question(`${colors.yellow}?${colors.reset} Enter user ID: `);
    }

    // First verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminUser: true
      }
    });

    if (!user) {
      console.error(`${colors.red}✗ Error: User not found${colors.reset}`);
      process.exit(1);
    }

    // Display current status
    const isAdmin = await checkAdminStatus(userId);
    await displayUserInfo(user, isAdmin);

    // Get action from user
    const action = await promptForAction();
    
    switch (action) {
      case 'toggle':
        await setAdminStatus(userId, !isAdmin);
        break;
      case 'enable':
        await setAdminStatus(userId, true);
        break;
      case 'disable':
        await setAdminStatus(userId, false);
        break;
      case 'exit':
        logger.debug(`\n${colors.gray}Goodbye! 👋${colors.reset}`);
        break;
    }

    // Display new status if action was taken
    if (action !== 'exit') {
      const newStatus = await checkAdminStatus(userId);
      logger.debug(`\n${colors.bright}New Status:${colors.reset} ${newStatus 
        ? `${colors.green}✓ Enabled${colors.reset}` 
        : `${colors.red}✗ Disabled${colors.reset}`}`);
    }

  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Handle errors
main().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error instanceof Error ? error.message : error);
  process.exit(1);
}); 