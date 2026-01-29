import { Injectable, inject, OnDestroy } from '@angular/core';
import { Firestore, collection, collectionData, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, orderBy, limit, where, DocumentData } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { Note } from '../interfaces/note.interface';

@Injectable({
  providedIn: 'root'
})
export class NoteListService implements OnDestroy {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];



  private unsubTrash!: () => void;
  private unsubNotes!: () => void;
  private unsubMarkedNotes!: () => void;
  private itemsSubscription!: Subscription;

  firestore: Firestore = inject(Firestore);
  items$: Observable<Note[]>;

  constructor() {
    // Listener starten
    this.unsubTrash = this.subTrashList();
    this.unsubNotes = this.subNotesList();
    this.unsubMarkedNotes = this.subMarkedNotesList();


    // Alle Notizen einmal abrufen und loggen
    this.items$ = collectionData(this.getCollectionRef("notes")) as Observable<Note[]>;
    this.itemsSubscription = this.items$.subscribe((list: Note[]) => {
      list.forEach((element: Note) => console.log(element));
    });
  }

  ngOnDestroy() {
    // Listener & Subscription sauber abmelden
    this.unsubTrash();
    this.unsubNotes();
    this.unsubMarkedNotes();
    this.itemsSubscription.unsubscribe();
  }

  /** Fügt eine Note in die gewünschte Collection hinzu */
  async addNote(item: Note, colID: "notes" | "trash"): Promise<void> {
    try {
      const docRef = await addDoc(this.getCollectionRef(colID), item);
      console.log("Document written with ID:", docRef.id);
    } catch (err) {
      console.error("Error adding note:", err);
    }
  }

  /** Löscht ein Dokument */
  async deleteNote(colID: "notes" | "trash", docID: string): Promise<void> {
    try {
      await deleteDoc(this.getSingleDocRef(colID, docID));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  }

  /** Aktualisiert ein bestehendes Dokument */
  async updateNote(note: Note): Promise<void> {
    if (!note.id) return;

    const docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
    try {
      await updateDoc(docRef, this.getCleanJson(note));
    } catch (err) {
      console.error("Error updating note:", err);
    }
  }

  /** Bereinigt Note-Objekt für Firestore (keine ID oder UI-States) */
  getCleanJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked
    };
  }

  /** Hilfsfunktion: Collection basierend auf Note-Typ */
  getColIdFromNote(note: Note): "notes" | "trash" {
    return note.type === 'note' ? "notes" : "trash";
  }

  /** Referenz auf eine Collection */
  getCollectionRef(colID: "notes" | "trash") {
    return collection(this.firestore, colID);
  }

  /** Referenz auf ein einzelnes Dokument */
  getSingleDocRef(colID: "notes" | "trash", docID: string) {
    return doc(this.firestore, `${colID}/${docID}`);
  }

  /** Firestore-Daten in Note-Objekt umwandeln */
  setNoteObject(obj: DocumentData, id: string): Note {
    return {
      id: id || '',
      type: obj['type'] || 'note',      // Zugriff über Index
      title: obj['title'] || '',
      content: obj['content'] || '',
      marked: obj['marked'] || false
    };
  }


  /** Listener für Trash-Collection */
  subTrashList(): () => void {

    return onSnapshot(this.getCollectionRef("trash"), snapshot => {
      this.trashNotes = [];
      snapshot.forEach((element: any) => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  /** Listener für Notes-Collection */
  subNotesList(): () => void {
    const q = query(this.getNotesRef(), limit(100));
    return onSnapshot(q, (list) => {
      list.forEach(eleemnt => {
        this.normalNotes.push(this.setNoteObject(eleemnt.data(), eleemnt.id));
      });
    });
  }


  subMarkedNotesList(): () => void {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100));
    return onSnapshot(q, (list) => {
      list.forEach(eleemnt => {
        this.normalMarkedNotes.push(this.setNoteObject(eleemnt.data(), eleemnt.id));
      });
    });
  }

  /*
      return onSnapshot(this.getCollectionRef("notes"), snapshot => {
        this.normalNotes = [];
        snapshot.forEach((element: any) => {
          this.normalNotes.push(this.setNoteObject(element.data(), element.id));
        });
      });
    }
  */
  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }
}
