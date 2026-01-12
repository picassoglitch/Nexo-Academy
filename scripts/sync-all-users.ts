/**
 * Script to sync all users from Supabase Auth to Prisma
 * Run with: npx tsx scripts/sync-all-users.ts
 */

import { syncAllUsersFromSupabase } from "../lib/sync-supabase-user"

async function main() {
  console.log("🔄 Starting bulk sync of all users from Supabase Auth to Prisma...")
  
  try {
    const result = await syncAllUsersFromSupabase()
    console.log(`\n✅ Sync complete!`)
    console.log(`   - Synced: ${result.synced} users`)
    console.log(`   - Errors: ${result.errors} users`)
    
    if (result.errors > 0) {
      console.log(`\n⚠️  Some users failed to sync. Check logs above for details.`)
      process.exit(1)
    } else {
      console.log(`\n🎉 All users synced successfully!`)
      process.exit(0)
    }
  } catch (error) {
    console.error("\n❌ Fatal error during sync:", error)
    process.exit(1)
  }
}

main()
