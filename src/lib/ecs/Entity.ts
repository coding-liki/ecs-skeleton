export default class Entity {
  private id: string;
  private tags?: string[] = [];

  constructor(id?: string, tags?: string[]) {
    this.id = id ? id : "";

    this.tags = tags;
  }

    public getId = (): string  => this.id;
    public setId = (id: string) => {
        this.id = id
    }

    public getTags = (): string[] | undefined => this.tags;
    public setTags = (tags: string[]) => {
        this.tags = tags
    }
}

