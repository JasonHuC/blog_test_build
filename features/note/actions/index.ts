'use server';

import { type Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { getSkip } from '@/utils';

import {
  type CreateNoteDTO,
  type GetNotesDTO,
  type UpdateNoteDTO,
  createNoteSchema,
  getNotesSchema,
  updateNoteSchema,
} from '../types';

export const isNoteExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.note.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getNotes = async (params: GetNotesDTO) => {
  const result = await getNotesSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const cond: Prisma.NoteWhereInput = {};
  // TODO: 想个办法优化一下，这个写法太啰嗦了，好多 if
  if (result.data.body?.trim()) {
    cond.OR = [
      ...(cond.OR ?? []),
      ...[
        {
          body: {
            contains: result.data.body?.trim(),
          },
        },
      ],
    ];
  }

  if (result.data.tags?.length) {
    cond.OR = [
      ...(cond.OR ?? []),
      ...[
        {
          tags: {
            some: {
              id: {
                in: result.data.tags,
              },
            },
          },
        },
      ],
    ];
  }

  const sort: Prisma.NoteOrderByWithRelationInput = {};
  if (result.data.orderBy && result.data.order) {
    sort[result.data.orderBy] = result.data.order;
  }

  const total = await prisma.note.count({ where: cond });
  const notes = await prisma.note.findMany({
    include: {
      tags: true,
    },
    orderBy: sort,
    where: cond,
    take: result.data.pageSize,
    skip: getSkip(result.data.pageIndex, result.data.pageSize),
  });

  return { notes, total };
};

export const getAllNotes = async () => {
  const total = await prisma.note.count({});
  const notes = await prisma.note.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      tags: true,
    },
  });

  return { notes, total };
};

export const getNoteByID = async (id: string) => {
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      tags: true,
    },
  });

  return { note };
};

export const deleteNoteByID = async (id: string) => {
  const isExist = await isNoteExistByID(id);

  if (!isExist) {
    throw new Error('Note不存在');
  }

  await prisma.note.delete({
    where: {
      id,
    },
  });
};

export const createNote = async (params: CreateNoteDTO) => {
  const result = await createNoteSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  await prisma.note.create({
    data: {
      body: result.data.body,
      tags: {
        connect: result.data.tags
          ? result.data.tags.map((tagID) => ({ id: tagID }))
          : undefined,
      },
    },
  });
};

export const updateNote = async (params: UpdateNoteDTO) => {
  const result = await updateNoteSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const note = await prisma.note.findUnique({
    where: {
      id: result.data.id,
    },
    include: { tags: true },
  });

  if (!note) {
    throw new Error('Note不存在');
  }

  const noteTagIDs = note?.tags.map((el) => el.id);
  // 新增的 tags
  const needConnect = result.data.tags?.filter(
    (el) => !noteTagIDs?.includes(el),
  );
  // 需要移除的 tags
  const needDisconnect = note?.tags
    .filter((el) => !result.data.tags?.includes(el.id))
    ?.map((el) => el.id);

  await prisma.note.update({
    data: {
      body: result.data.body,
      tags: {
        connect: needConnect?.length
          ? needConnect.map((tagID) => ({ id: tagID }))
          : undefined,
        disconnect: needDisconnect?.length
          ? needDisconnect.map((tagID) => ({ id: tagID }))
          : undefined,
      },
    },
    where: {
      id: result.data.id,
    },
  });
};