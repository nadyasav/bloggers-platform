import express from 'express';
import { setupApp } from '../../src/setup-app';

export const app = setupApp(express());
