import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createError, ErrorTypes } from '../utils/errorHandler.js';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'İsim alanı zorunludur!'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Soyisim alanı zorunludur!'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email alanı zorunludur!'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Şifre alanı zorunludur!'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır!'],
        select: false
    },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'ADMIN', 'USER'],
        default: 'USER'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Şifre hashleme middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Kullanıcı listesi için özel metod
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// Email değişikliğini kontrol et
userSchema.pre('save', async function(next) {
    if (this.isModified('email')) {
        const existingUser = await this.constructor.findOne({ email: this.email });
        if (existingUser && existingUser._id.toString() !== this._id.toString()) {
            throw createError('Bu email adresi ile kayıtlı bir kullanıcı var!', ErrorTypes.VALIDATION, 400);
        }
    }
    next();
});

// Model oluştur
const User = mongoose.model('User', userSchema);

export { User }; 