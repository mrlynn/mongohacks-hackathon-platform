import { MongoClient, ObjectId } from 'mongodb';

async function checkAtlasClusters() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://mike:Password678%21@performance.zbcul.mongodb.net';
  const dbName = 'hackathon-platform';
  
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Count documents
    const count = await db.collection('atlasclusters').countDocuments();
    console.log(`\nTotal documents in atlasclusters: ${count}`);
    
    // Get all documents
    const docs = await db.collection('atlasclusters').find({}).toArray();
    console.log(`\nAll documents (${docs.length}):`);
    docs.forEach(doc => {
      console.log(`  - ID: ${doc._id}, Status: ${doc.status}, Team: ${doc.teamId}`);
    });
    
    // Check for the phantom ID (try both string and ObjectId)
    const phantomId = '69a2b76edf6e529f3e10a134';
    
    const phantomString = await db.collection('atlasclusters').findOne({ _id: phantomId });
    console.log(`\nPhantom as string (_id: "${phantomId}"):`, phantomString ? 'FOUND' : 'NOT FOUND');
    
    try {
      const phantomObjectId = await db.collection('atlasclusters').findOne({ 
        _id: new ObjectId(phantomId) 
      });
      console.log(`Phantom as ObjectId (_id: ObjectId("${phantomId}")):`, phantomObjectId ? 'FOUND' : 'NOT FOUND');
      
      if (phantomObjectId) {
        console.log('\n📋 Phantom cluster details:', JSON.stringify(phantomObjectId, null, 2));
      }
    } catch (e) {
      console.log(`Phantom as ObjectId: Invalid ObjectId format`);
    }
    
    // Check for non-deleted clusters
    const active = await db.collection('atlasclusters').find({
      status: { $nin: ['deleted'] }
    }).toArray();
    console.log(`\nNon-deleted clusters: ${active.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkAtlasClusters();
