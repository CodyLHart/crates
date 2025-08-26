import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { auth } from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

// MongoDB connection
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for collections");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectDB();

// Get all collections for a user
router.get("/", auth, async (req, res) => {
  try {
    const database = client.db("crates");
    const collections = database.collection("collections");

    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userCollections = await collections
      .find({ userId: userId })
      .toArray();
    res.json(userCollections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

// Add album to user's collection
router.post("/album", auth, async (req, res) => {
  try {
    const database = client.db("crates");
    const collections = database.collection("collections");

    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const {
      title,
      artist,
      year,
      thumb,
      discogsId,
      addedAt,
      genre,
      style,
      country,
      format,
      label,
      catno,
      barcode,
      tracks,
      notes,
      masterId,
      status,
    } = req.body;

    // Validate required fields
    if (!title || !artist || !discogsId) {
      return res.status(400).json({
        error: "Title, artist, and discogsId are required",
      });
    }

    // Check if album already exists for this user
    const existingAlbum = await collections.findOne({
      userId,
      "records.discogsId": discogsId,
    });

    if (existingAlbum) {
      return res.status(409).json({
        error: "Album already exists in your collection",
      });
    }

    // Find or create a default collection for the user
    let userCollection = await collections.findOne({
      userId,
      name: "My Collection",
    });

    if (!userCollection) {
      // Create default collection if it doesn't exist
      const defaultCollection = {
        name: "My Collection",
        description: "Your vinyl collection",
        records: [],
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collections.insertOne(defaultCollection);
      userCollection = { ...defaultCollection, _id: result.insertedId };
    }

    // Add album to the collection with enhanced data
    const albumData = {
      _id: new ObjectId(),
      title,
      artist,
      year,
      thumb,
      discogsId,
      addedAt: addedAt || new Date(),
      // Additional enhanced fields
      genre,
      style,
      country,
      format,
      label,
      catno,
      barcode,
      tracks,
      notes,
      masterId,
      status,
    };

    const result = await collections.updateOne(
      { _id: userCollection._id },
      {
        $push: { records: albumData },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(500)
        .json({ error: "Failed to add album to collection" });
    }

    res.status(201).json(albumData);
  } catch (error) {
    console.error("Error adding album:", error);
    res.status(500).json({ error: "Failed to add album to collection" });
  }
});

// Get a specific collection by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const database = client.db("crates");
    const collections = database.collection("collections");

    const collectionId = req.params.id;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const collection = await collections.findOne({
      _id: new ObjectId(collectionId),
      userId: userId,
    });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
});

// Create a new collection
router.post("/", auth, async (req, res) => {
  try {
    const database = client.db("crates");
    const collections = database.collection("collections");

    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { name, description, records = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Collection name is required" });
    }

    const newCollection = {
      name,
      description,
      records,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collections.insertOne(newCollection);
    newCollection._id = result.insertedId;

    res.status(201).json(newCollection);
  } catch (error) {
    console.error("Error creating collection:", error);
    res.status(500).json({ error: "Failed to create collection" });
  }
});

// Add album to user's collection
router.post("/album", auth, async (req, res) => {
  try {
    const database = client.db("crates");
    const collections = database.collection("collections");

    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { title, artist, year, thumb, discogsId, addedAt } = req.body;

    // Validate required fields
    if (!title || !artist || !discogsId) {
      return res.status(400).json({
        error: "Title, artist, and discogsId are required",
      });
    }

    // Check if album already exists for this user
    const existingAlbum = await collections.findOne({
      userId,
      "records.discogsId": discogsId,
    });

    if (existingAlbum) {
      return res.status(409).json({
        error: "Album already exists in your collection",
      });
    }

    // Find or create a default collection for the user
    let userCollection = await collections.findOne({
      userId,
      name: "My Collection",
    });

    if (!userCollection) {
      // Create default collection if it doesn't exist
      const defaultCollection = {
        name: "My Collection",
        description: "Your vinyl collection",
        records: [],
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collections.insertOne(defaultCollection);
      userCollection = { ...defaultCollection, _id: result.insertedId };
    }

    // Add album to the collection
    const albumData = {
      _id: new ObjectId(),
      title,
      artist,
      year,
      thumb,
      discogsId,
      addedAt: addedAt || new Date(),
    };

    const result = await collections.updateOne(
      { _id: userCollection._id },
      {
        $push: { records: albumData },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(500)
        .json({ error: "Failed to add album to collection" });
    }

    res.status(201).json(albumData);
  } catch (error) {
    console.error("Error adding album:", error);
    res.status(500).json({ error: "Failed to add album to collection" });
  }
});

// Update a collection
router.put("/:id", auth, async (req, res) => {
  try {
    const database = client.db("crates");
    const collections = database.collection("collections");

    const collectionId = req.params.id;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { name, description, records } = req.body;

    const updateData = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (records !== undefined) updateData.records = records;

    const result = await collections.updateOne(
      {
        _id: new ObjectId(collectionId),
        userId: userId,
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json({ message: "Collection updated successfully" });
  } catch (error) {
    console.error("Error updating collection:", error);
    res.status(500).json({ error: "Failed to update collection" });
  }
});

// Delete a collection
router.delete("/:id", auth, async (req, res) => {
  try {
    const database = client.db("crates");
    const collections = database.collection("collections");

    const collectionId = req.params.id;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const result = await collections.deleteOne({
      _id: new ObjectId(collectionId),
      userId: userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    res.status(500).json({ error: "Failed to delete collection" });
  }
});

// Get individual album details by album ID
router.get("/album/:albumId", auth, async (req, res) => {
  try {
    const database = client.db("crates");
    const collections = database.collection("collections");

    const albumId = req.params.albumId;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Find the collection containing this album
    const collection = await collections.findOne({
      userId: userId,
      "records._id": new ObjectId(albumId),
    });

    if (!collection) {
      return res.status(404).json({ error: "Album not found" });
    }

    // Extract the specific album from the records array
    const album = collection.records.find(
      (record) => record._id.toString() === albumId
    );

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    res.json(album);
  } catch (error) {
    console.error("Error fetching album:", error);
    res.status(500).json({ error: "Failed to fetch album details" });
  }
});

// Update album information
router.put("/album/:albumId", auth, async (req, res) => {
  try {
    const database = client.db("crates");
    const collections = database.collection("collections");

    const userId = req.user.userId;
    const { albumId } = req.params;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Validate that we're not updating critical fields
    const allowedUpdates = [
      "artist",
      "title",
      "year",
      "genre",
      "style",
      "notes",
    ];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        filteredUpdates[key] = updateData[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Update the specific album in the user's collection
    const result = await collections.updateOne(
      {
        userId: userId,
        "records._id": new ObjectId(albumId),
      },
      {
        $set: Object.fromEntries(
          Object.entries(filteredUpdates).map(([key, value]) => [
            `records.$.${key}`,
            value,
          ])
        ),
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Album not found" });
    }

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "No changes made" });
    }

    res.json({
      message: "Album updated successfully",
      updatedFields: Object.keys(filteredUpdates),
    });
  } catch (error) {
    console.error("Error updating album:", error);
    res.status(500).json({ error: "Failed to update album" });
  }
});

// Delete individual album from collection
router.delete("/album/:albumId", auth, async (req, res) => {
  try {
    const database = client.db("crates");
    const collections = database.collection("collections");

    const albumId = req.params.albumId;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Find and update the collection to remove the specific album
    const result = await collections.updateOne(
      {
        userId: userId,
        "records._id": new ObjectId(albumId),
      },
      {
        $pull: { records: { _id: new ObjectId(albumId) } },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Album not found" });
    }

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ error: "Album not found or already removed" });
    }

    res.json({ message: "Album removed from collection successfully" });
  } catch (error) {
    console.error("Error deleting album:", error);
    res.status(500).json({ error: "Failed to delete album from collection" });
  }
});

export default router;
