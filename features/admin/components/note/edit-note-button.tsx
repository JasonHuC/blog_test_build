'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { TagTypeEnum } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

import { BytemdEditor } from '@/components/bytemd';
import { IconSolarPen, IconSolarRestartLinear } from '@/components/icons';

import {
  type UpdateNoteDTO,
  updateNoteSchema,
  useGetNote,
  useUpdateNote,
} from '@/features/note';
import { useGetAllTags } from '@/features/tag';

import { CreateTagButton } from '../tag';

type EditNoteButtonProps = {
  id: string;
  refreshAsync: () => Promise<unknown>;
};

export const EditNoteButton = ({ id, refreshAsync }: EditNoteButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<UpdateNoteDTO>({
    resolver: zodResolver(updateNoteSchema),
  });

  const { data } = useGetNote(id, open);
  const getTagsQuery = useGetAllTags(TagTypeEnum.NOTE);
  const tags = React.useMemo(() => {
    return getTagsQuery.data?.tags ?? [];
  }, [getTagsQuery]);

  const updateNoteQuery = useUpdateNote();

  React.useEffect(() => {
    if (open && data?.note) {
      const { note } = data;
      form.setValue('body', note.body);
      form.setValue('published', note.published);
      form.setValue('tags', note?.tags?.map((el) => el.id) ?? []);
      form.setValue('id', note.id);
      form.clearErrors();
    }
  }, [data, form, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={'icon'} variant="outline" onClick={() => setOpen(true)}>
          <IconSolarPen className="text-base" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑笔记</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form autoComplete="off">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签</FormLabel>
                    <FormControl>
                      <div className="flex space-x-4 items-center">
                        <div className="flex-1">
                          <Combobox
                            options={
                              tags?.map((el) => ({
                                label: el.name,
                                value: el.id,
                              })) ?? []
                            }
                            multiple
                            clearable
                            selectPlaceholder="请选择标签"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </div>

                        <CreateTagButton
                          refreshAsync={getTagsQuery.refreshAsync}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>是否发布</FormLabel>
                    <FormControl>
                      <div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>内容</FormLabel>
                    <FormControl>
                      <BytemdEditor
                        body={field.value}
                        setContent={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => form.handleSubmit(handleSubmit)()}
                  disabled={updateNoteQuery.loading}
                >
                  {updateNoteQuery.loading && (
                    <IconSolarRestartLinear className="mr-2 text-base animate-spin" />
                  )}
                  保存
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  async function handleSubmit(values: UpdateNoteDTO) {
    await updateNoteQuery.runAsync(values);
    setOpen(false);
    await refreshAsync();
  }
};
