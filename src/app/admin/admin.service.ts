import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AuthService } from "../shared/auth.service";
import { map, Observable } from "rxjs";
import { User } from "../shared/user";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth,
    private authService: AuthService,
  ) {}

  getAllUsers(): Observable<User[]> {
    return this.firestore
      .collection<User>("users")
      .valueChanges({ idField: "uid" });
  }

  async updateUserRole(userId: string, newRole: string): Promise<void> {
    try {
      await this.firestore.doc(`users/${userId}`).update({
        role: newRole,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  async toggleUserBan(
    userId: string,
    currentBanStatus: boolean,
  ): Promise<void> {
    try {
      await this.firestore.doc(`users/${userId}`).update({
        banned: !currentBanStatus,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error toggling user ban status:", error);
      throw error;
    }
  }

  async createDoctor(doctorData: any): Promise<void> {
    try {
      const credential = await this.auth.createUserWithEmailAndPassword(
        doctorData.email,
        doctorData.password,
      );

      if (!credential.user) throw new Error("Failed to create user");

      const userData: Partial<User> = {
        uid: credential.user.uid,
        email: doctorData.email,
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        role: "doctor",
        banned: false,
        doctorDetails: doctorData.doctorDetails,
      };

      await this.firestore
        .collection("users")
        .doc(credential.user.uid)
        .set(userData);
    } catch (error) {
      console.error("Error creating doctor:", error);
      throw error;
    }
  }

  async updateDoctor(uid: string, updateData: Partial<User>): Promise<void> {
    try {
      const update = {
        ...updateData,
        updatedAt: new Date(),
      };

      await this.firestore.collection("users").doc(uid).update(update);
    } catch (error) {
      console.error("Error updating doctor:", error);
      throw error;
    }
  }

  updatePersistence(type: "LOCAL" | "SESSION" | "NONE"): Promise<void> {
    return this.authService.setPersistence(type);
  }
}
