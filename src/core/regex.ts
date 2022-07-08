export class FolodyRegex {
  /**
   * Regex for youtube video id
   */
  public static youtubeVideoRegex = new RegExp(/(?:youtube\.com\/(?:[^\\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\\/\s]{11})/,);
  public static youtubePlaylistRegex = new RegExp(/(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*/,);
}